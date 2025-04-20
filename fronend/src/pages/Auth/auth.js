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