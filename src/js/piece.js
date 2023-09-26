class Piece {
    constructor(ctx) {
        this.ctx = ctx;
        this.color = 'blue';
        // this.color = this.originalColor;
        this.shape = [
            [2, 0, 0],
            [2, 2, 2],
            [0, 0, 0]
        ];

        // Начальная позиция
        this.x = 3;
        this.y = 0;
        this.spawn();
    }
    spawn() {
        this.typeId = this.randomizeTetrominoType(COLORS.length - 1);
        this.shape = SHAPES[this.typeId];
        this.color = COLORS[this.typeId];
        this.x = 0;
        this.y = 0;
    }
    //раскрашиваем блоки фигурки только те которые больше 0
    draw() {
        // console.log(this.color)
        this.ctx.fillStyle = this.color ;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                // this.x, this.y - левый верхний угол фигурки на игровом поле
                // x, y - координаты ячейки относительно матрицы фигурки (3х3)
                // this.x + x - координаты ячейки на игровом поле
                if (value > 0) {
                    this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
                }
            });
        });
    }
    move(p) {
        this.x = p.x;
        this.y = p.y;
    }
    // параметр noOfTypes - количество вариантов
    randomizeTetrominoType(noOfTypes) {
        return Math.floor(Math.random() * noOfTypes);
    }

// расположить фигурку в центре поля
    setStartPosition() {
        this.x = this.typeId === 4 ? 4 : 3;
    }
}
