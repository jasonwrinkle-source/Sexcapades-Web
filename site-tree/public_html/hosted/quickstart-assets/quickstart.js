/* ---- inline block 1 (document order) ---- */

    (function () {
      var counter = document.querySelector('.site-counter');
      if (!counter) return;

      var host = window.location.hostname.toLowerCase();
      if (host !== 'sexcapades.io' && host !== 'www.sexcapades.io') return;

      var number = counter.querySelector('.site-counter-number');
      var uuid = null;

      try {
        uuid = window.localStorage.getItem('sexcapades_visitor_uuid');
        if (!uuid) {
          uuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (character) {
                var random = Math.random() * 16 | 0;
                var value = character === 'x' ? random : (random & 0x3 | 0x8);
                return value.toString(16);
              });
          window.localStorage.setItem('sexcapades_visitor_uuid', uuid);
        }
      } catch (error) {
        uuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (character) {
              var random = Math.random() * 16 | 0;
              var value = character === 'x' ? random : (random & 0x3 | 0x8);
              return value.toString(16);
            });
      }

      fetch('counter.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: 'uuid=' + encodeURIComponent(uuid),
        cache: 'no-store',
        credentials: 'same-origin'
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Counter unavailable');
          return response.json();
        })
        .then(function (data) {
          if (data && typeof data.visitors === 'number') {
            number.textContent = data.visitors.toLocaleString();
          }
        })
        .catch(function () {});
    })();
  
/* ---- inline block 2 (document order) ---- */

    (function () {
      var dropdown = document.getElementById('start-dropdown');
      if (!dropdown) return;

      var trigger = dropdown.querySelector('.dropdown-trigger');

      function setOpen(open) {
        dropdown.classList.toggle('open', open);
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      }

      function isOpen() {
        return dropdown.classList.contains('open');
      }

      trigger.addEventListener('click', function (event) {
        event.stopPropagation();
        setOpen(!isOpen());
      });

      document.addEventListener('click', function (event) {
        if (isOpen() && !dropdown.contains(event.target)) setOpen(false);
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && isOpen()) {
          setOpen(false);
          trigger.focus();
        }
      });

      dropdown.querySelectorAll('.dropdown-menu a').forEach(function (link) {
        link.addEventListener('click', function () { setOpen(false); });
      });
    })();
  
/* ---- inline block 3 (document order) ---- */

(function(){var c=document.getElementById('odometer-digits-QS');if(!c)return;
function render(n){try{var s=String(n).padStart(6,'0');c.innerHTML='';for(var i=0;i<s.length;i++){var d=document.createElement('div');d.className='odometer-digit';d.textContent=s[i];c.appendChild(d);}}catch(e){}}
try{
fetch('/hosted/api/collect.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'get_stats'})}).then(function(r){return r.json();}).then(function(d){render((d&&d.unique_visitors)||0);}).catch(function(){render(0);});
}catch(e){render(0);}})();
