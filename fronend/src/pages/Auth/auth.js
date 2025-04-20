import { auth,signInWithEmailAndPassword,GoogleAuthProvider,provider,signInWithPopup,providerMicrosoft,OAuthProvider } from "../../../../backend/src/config/firebaseConfig.js";

 // Script para alternar entre os formulários de login e cadastro
 document.getElementById('show-signup').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});


 // Script para redirecionar ao clicar no logo
document.getElementById('valluo-logo').addEventListener('click', function() {
    window.location.href = '../home';
});

document.getElementById('valluo-logo-signup').addEventListener('click', function() {
    window.location.href = '../home';
});

// Google
const googleButton = document.getElementById('googleLogin');
googleButton.addEventListener("click", function(event) {
  signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const user = result.user;
    window.location.href = "dashboard2.html";

  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // ...
  });

});