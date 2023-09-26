class Board {
    constructor(ctx, ctxNext) {
        this.ctx = ctx;
        this.ctxNext = ctxNext;
        this.piece = null;
        this.next = null;
    }

    // Сбрасывает игровое поле перед началом новой игры
    reset() {
        this.grid = this.getEmptyBoard();
        this.piece = new Piece(this.ctx);
        this.piece.setStartPosition();
        this.getNewPiece();
    }

    // Создает матрицу нужного размера, заполненную нулями
    getEmptyBoard() {
        return Array.from(
            {length: ROWS}, () => Array(COLS).fill(0)
        );
    }
    valid(p) {
        return p.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let x = p.x + dx;
                let y = p.y + dy;
                return value === 0 ||
                    (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y));
            });
        });
    }
    insideWalls(x) {
        return x >= 0 && x < COLS;
    }

    aboveFloor(y) {
        return y <= ROWS;
    }

// не занята ли клетка поля другими фигурками
    notOccupied(x, y) {
        return this.grid[y] && this.grid[y][x] === 0;
    }

    rotate(p){
        // Клонирование матрицы
        let clone = JSON.parse(JSON.stringify(p));
        // алгоритм вращения
        // Транспонирование матрицы тетрамино
        for (let y = 0; y < p.shape.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [p.shape[x][y], p.shape[y][x]] =
                    [p.shape[y][x], p.shape[x][y]];
            }
        }
// Изменение порядка колонок
        p.shape.forEach(row => row.reverse());

        return clone;
    }

    draw() {
        this.piece.draw();
        this.drawBoard();
    }

    drawBoard() {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillStyle = COLORS[value - 1];
                    this.ctx.fillRect(x, y, 1, 1);
                }
            });
        });
    }

    drop() {
        let p = moves[KEY.DOWN](this.piece);
        if (this.valid(p)) {
            this.piece.move(p);
        } else {
            this.freeze();
            this.clearLines();
            if (this.piece.y === 0) {
                // Если y-координата равна 0, т игра заканичвается очеек для падения нет.
                return false;
            }
            this.piece = this.next;
            this.piece.ctx = this.ctx;
            this.piece.setStartPosition();
            this.getNewPiece();
        }
        return true;
    }
    freeze() {
        this.piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.grid[y + this.piece.y][x + this.piece.x] = value;
                }
            });
        });
    }
    getLineClearPoints(lines, level) {
        const lineClearPoints = lines === 1 ? POINTS.SINGLE :
            lines === 2 ? POINTS.DOUBLE :
                lines === 3 ? POINTS.TRIPLE :
                    lines === 4 ? POINTS.TETRIS :
                        0;
        if(level) {
            return (level + 1) * lineClearPoints;
        }
        return lineClearPoints;
    }
    clearLines() {
        let lines = 0;

        this.grid.forEach((row, y) => {
            // Если все клетки в ряду заполнены
            if (row.every(value => value > 0)) {
                lines++;

                // Удалить этот ряд
                this.grid.splice(y, 1);

                // Добавить наверх поля новый пустой ряд клеток
                this.grid.unshift(Array(COLS).fill(0));
            }
            if (lines > 0) {
                // Добавить очки за собранные линии
                console.log(typeof this.getLineClearPoints(lines))
                account.score += this.getLineClearPoints(lines);
                account.lines += lines;
            }
            // Если собрано нужное кол-во линий, перейти на новый уровень
            if (account.lines >= LINES_PER_LEVEL) {
                // увеличить уровень
                account.level++;
                // сбросить счетчик линий
                account.lines -= LINES_PER_LEVEL;
                // увеличить скорость
                time.level = LEVEL[account.level];
            }
        });
    }

    getNewPiece() {
        this.next = new Piece(this.ctxNext);
        this.ctxNext.clearRect(
            0,
            0,
            this.ctxNext.canvas.width,
            this.ctxNext.canvas.height
        );
        this.next.draw();
    }
}
