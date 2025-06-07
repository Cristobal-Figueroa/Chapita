// Este script desactiva cualquier service worker previo
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Service Worker desregistrado');
    }
  });
}
