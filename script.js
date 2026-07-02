// Variável para contar o número de vezes que o botão "Não" foi clicado
var naoCounter = 0;

// Função que é chamada quando o botão "Sim" é clicado
function sim() {
    alert("Você aceitou namorar comigo! :)");

    // Oculta elementos desnecessários
    var video = document.getElementById("meuVideo");
    var simBtn = document.getElementById("sim");
    var naoBtn = document.getElementById("nao");
    var title = document.getElementById("title");

    // Exibe o vídeo
    video.volume = 0.3;
    video.style.display = "none";
    video.play();

    simBtn.style.display = "none";
    naoBtn.style.display = "none";
    title.style.display = "none";

    // Exibe mensagem de aceitação
    var textBox = document.getElementById("textBox");
    textBox.style.display = "block";

    // Exibe gif de coração
    var gif = document.getElementById("heart3");
    gif.style.display = "block";

    // Inicia os fogos de artifício
    const container = document.getElementById('conteudo');
    const fireworks = new Fireworks(container, {
        rocketsPoint: 50,
        opacity: 0.5,
        speed: 3,
        acceleration: 1.05,
        friction: 0.98,
        gravity: 1.5,
        particles: 50,
        trace: 3,
        explosion: 5,
        boundaries: {
            top: 50,
            bottom: container.clientHeight,
            left: 50,
            right: container.clientWidth
        },
        sound: {
            enable: true,
            files: [
                'https://cdn.jsdelivr.net/npm/fireworks-js@1/dist/sounds/explosion0.mp3',
                'https://cdn.jsdelivr.net/npm/fireworks-js@1/dist/sounds/explosion1.mp3',
                'https://cdn.jsdelivr.net/npm/fireworks-js@1/dist/sounds/explosion2.mp3'
            ],
            volume: {
                min: 4,
                max: 8
            }
        }
    });
    fireworks.start();

    // Após 5 minutos, para os fogos
    setTimeout(() => {
        fireworks.stop();
    }, 300000);
}

// Função chamada quando o botão "Não" é clicado
function desvia(btn) {
    // Move o botão "Não" para uma posição aleatória na tela
    btn.style.position = 'absolute';
    btn.style.bottom = geraPosicao(10, 90);
    btn.style.left = geraPosicao(10, 90);
    
    if (naoCounter === 5) {
        document.getElementById('mensagem1').style.display = 'block';
    }
    console.log('opa, desviei...');
}

// Função para gerar uma posição aleatória
function geraPosicao(min, max) {
    return (Math.random() * (max - min) + min) + "%";
}