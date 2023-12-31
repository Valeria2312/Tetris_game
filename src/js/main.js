const canvas = document.getElementById('board');
//устанавливаем контекст для рисования в 2D
const ctx = canvas.getContext('2d');
const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');
let requestId;

const moves = {
    [KEY.LEFT]:  p => ({ ...p, x: p.x - 1 }),
    [KEY.RIGHT]: p => ({ ...p, x: p.x + 1 }),
    [KEY.DOWN]:    p => ({ ...p, y: p.y + 1 }),
    [KEY.SPACE]: p => ({ ...p, y: p.y + 1 }),
    [KEY.UP]: (p) => board.rotate(p),
};

let accountValues = {
    score: 0,
    lines: 0,
    level: 0
}

// Устанавливаем размеры холста
ctx.canvas.width = COLS * BLOCK_SIZE;
ctx.canvas.height = ROWS * BLOCK_SIZE;

//установим размеры поля подсказки
ctxNext.canvas.width = 4 * BLOCK_SIZE;
ctxNext.canvas.height = 4 * BLOCK_SIZE;
ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);

// Устанавливаем масштаб
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

let board = new Board(ctx, ctxNext);
const time = { start: 0, elapsed: 0, level: 1000 };



// Обновление данных на экране
function updateAccount(key, value) {
    let element = document.getElementById(key);
    if (element) {
        element.textContent = value;
    }
}

// Проксирование доступа к свойствам accountValues
let account = new Proxy(accountValues, {
    set: (target, key, value) => {
        target[key] = value;
        updateAccount(key, value);
        return true;
    }
});

function play() {
    resetGame();
    //Очищаем игровое поле
    board.reset();
    let piece = new Piece(ctx);
    board.piece = piece;
    board.piece.setStartPosition();
    animate();

}
function animate(now = 0) {
    // обновить истекшее время
    time.elapsed = now - time.start;
    // если время отображения текущего фрейма прошло
    if (time.elapsed > time.level) {
        // начать отсчет сначала
        time.start = now;
        // "уронить" активную фигурку
        if (!board.drop()) {
            gameOver();
            return;
        }
    }

    // очистить холст для отрисовки нового фрейма
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // отрисовать игровое поле
    board.draw();
    requestId = requestAnimationFrame(animate);
}

document.addEventListener('keydown', event => {
    if (event.keyCode === KEY.SPACE) {
        // Жесткое падение
        while (board.valid(p)) {
            board.piece.move(p);
            account.score += POINTS.HARD_DROP;
            console.log(account.score)
            // стирание старого отображения фигуры на холсте
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            board.piece.draw();

            p = moves[KEY.DOWN](board.piece);
        }
    } else {
        if (moves[event.keyCode]) {
            // отмена действий по умолчанию
            event.preventDefault();

            // получение новых координат фигурки
            let p = moves[event.keyCode](board.piece);

            // проверка нового положения
            if (board.valid(p)) {
                // реальное перемещение фигурки, если новое положение допустимо
                board.piece.move(p);
                // стирание старого отображения фигуры на холсте
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                board.piece.draw();
                if (event.keyCode === KEY.DOWN) {
                    account.score += POINTS.SOFT_DROP;
                    console.log(account.score)
                }
            }
        }
    }
});

function resetGame() {
    account.score = 0;
    account.lines = 0;
    account.level = 0;
    board.reset();
    let piece = new Piece(ctx);
    board.piece = piece;
    board.piece.setStartPosition();
}
function gameOver() {
    cancelAnimationFrame(requestId);
    console.log(ctx)
    ctx.fillStyle = 'black';
    ctx.fillRect(1, 3, 8, 1.2);
    ctx.font = '1px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText('GAME OVER', 1.8, 4);
}
