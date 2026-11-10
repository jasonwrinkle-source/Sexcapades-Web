/* Load independently cacheable datasets before the application initializes. */
(function(){
  'use strict';
  var base='assets/data/';
  var dataVersion='18';
  function read(name){
    return fetch(base+name+'?v='+dataVersion,{credentials:'same-origin',cache:'no-store'}).then(function(response){
      if(!response.ok) throw new Error('Could not load '+name+' ('+response.status+')');
      return response.json();
    });
  }
  function safeRead(name){
    return read(name).catch(function(error){
      console.error('Sexcapades dataset failed to load:',error);
      return {};
    });
  }
  function jsonElement(id,value){
    var element=document.getElementById(id);
    if(!element){
      element=document.createElement('script');
      element.type='application/json';
      element.id=id;
      document.head.appendChild(element);
    }
    element.textContent=JSON.stringify(value);
  }
  window.__SEXCAPADES_DATA_READY=Promise.all([
    safeRead('community-fetlife.json'),
    safeRead('community-reddit.json'),
    safeRead('community-discord.json'),
    safeRead('community-completion-time.json'),
    safeRead('fetlife-popularity-notes.json'),
    safeRead('fetlife-topic-canonical-map.json'),
    safeRead('prevalence.json'),
    safeRead('popularity.json'),
    safeRead('sample-profiles.json')
  ]).then(function(data){
    window.__SEXCAPADES_FETLIFE_GROUPS=data[0];
    window.__SEXCAPADES_REDDIT_GROUPS=data[1];
    window.__SEXCAPADES_DISCORD_GROUPS=data[2];
    window.__SEXCAPADES_PREVALENCE=data[6];
    window.__SEXCAPADES_POPULARITY_DATA=data[7];
    window.SEXCAPADES_SAMPLE_PROFILES=data[8];
    jsonElement('fetlifeGroupMappingData',data[0]);
    jsonElement('redditGroupMappingData',data[1]);
    jsonElement('discordGroupMappingData',data[2]);
    jsonElement('communityCompletionTimeData',data[3]);
    jsonElement('fetlifePopularityNoteData',data[4]);
    jsonElement('fetlifeTopicCanonicalMapData',data[5]);
  }).catch(function(error){
    console.error('Sexcapades data load failed:',error);
    window.__SEXCAPADES_FETLIFE_GROUPS=window.__SEXCAPADES_FETLIFE_GROUPS||{};
    window.__SEXCAPADES_REDDIT_GROUPS=window.__SEXCAPADES_REDDIT_GROUPS||{};
    window.__SEXCAPADES_DISCORD_GROUPS=window.__SEXCAPADES_DISCORD_GROUPS||{};
    window.__SEXCAPADES_PREVALENCE=window.__SEXCAPADES_PREVALENCE||{};
    window.__SEXCAPADES_POPULARITY_DATA=window.__SEXCAPADES_POPULARITY_DATA||{};
    window.SEXCAPADES_SAMPLE_PROFILES=window.SEXCAPADES_SAMPLE_PROFILES||{};
  });
})();
