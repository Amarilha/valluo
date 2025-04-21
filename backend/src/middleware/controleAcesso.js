const { stateAuth } = require('../../services/estadoAuth');

async function controleAcesso(req, res, next) {
    try {
        const uid = await stateAuth();
        
        if (!uid) {
            // Se o usuário não estiver autenticado
            if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
                // Se for uma requisição AJAX, retornamos um erro 401
                return res.status(401).json({ error: 'Não autorizado' });
            }
            
            // Para requisições normais, redirecionamos para o login
            const redirectUrl = req.originalUrl;
            return res.redirect(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }

        // Se estiver autenticado, continuamos
        next();
    } catch (error) {
        console.error('Erro no controle de acesso:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

module.exports = controleAcesso;