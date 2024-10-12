const CLIENT_ID = '1048334234084978799';
const REDIRECT_URI = 'https://caydendev.github.io/editor.html';
const ALLOWED_USER_ID = '1004744186966311022';

function login() {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;
    window.location.href = authUrl;
}

function handleAuth() {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

    if (accessToken) {
        fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${tokenType} ${accessToken}`,
            },
        })
        .then(result => result.json())
        .then(response => {
            const { id } = response;
            if (id === ALLOWED_USER_ID) {
                document.getElementById('auth-container').style.display = 'none';
                document.getElementById('editor-container').style.display = 'block';
                AetherEditor.init();
            } else {
                alert('You are not authorized to access this editor.');
            }
        })
        .catch(console.error);
    }
}

document.getElementById('login-button').addEventListener('click', login);
window.onload = handleAuth;