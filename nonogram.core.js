'use strict';

// tags
// 's' = space
// ' ' = opened space
// 'b' = box
// '*' = opened box
// [...] = hint

const verify = (rows, columns, boxes) => {
    // note: telegram's limit
    if (typeof boxes === 'object') {
        return rows > 0 && columns > 0
            && (rows + 1) * (columns + 1) <= 100 && columns <= 7;
    }

    return rows > 0 && columns > 0 && boxes > 0
        && (rows + 1) * (columns + 1) <= 100 && columns <= 7 && boxes <= rows * columns;
};

const init = (rows, columns, boxes, correct) => {
    const map = [];

    let space = rows * columns;
    let remain = boxes;

    for (let i = 0; i <= rows; i += 1) {
        map.push([]);

        for (let j = 0; j <= columns; j += 1) {
            if (i === 0 || j === 0) {
                map[i].push([0]);
            } else {
                let condition = false;

                if (typeof boxes === 'object') {
                    condition = boxes[i - 1][j - 1];
                } else {
                    condition = Math.random() * space < remain;

                    space -= 1;
                    remain -= condition;
                }

                if (condition) {
                    map[i].push('b');

                    map[i][0][map[i][0].length - 1] += 1;
                    map[0][j][map[0][j].length - 1] += 1;
                } else {
                    map[i].push('s');

                    if (map[i][0][map[i][0].length - 1] > 0) {
                        map[i][0].push(0);
                    }

                    if (map[0][j][map[0][j].length - 1] > 0) {
                        map[0][j].push(0);
                    }
                }
            }
        }
    }

    for (let i = 0; i <= rows; i += 1) {
        for (let j = 0; j <= columns; j += 1) {
            if (i === 0 || j === 0) {
                if (map[i][j].length === 1) {
                    let size = 0;

                    if (correct === ' ') {
                        if (i > 0) {
                            size = columns;
                        } else if (j > 0) {
                            size = rows;
                        }
                    }

                    if (map[i][j][0] === size) {
                        map[i][j].pop();
                    }
                } else if (map[i][j][map[i][j].length - 1] === 0) {
                    map[i][j].pop();
                }
            }
        }
    }

    return map;
};

const finished = (map, correct) => {
    for (const i in map) {
        for (const j in map[i]) {
            if (correct === ' ' && map[i][j] === 's' || correct === '*' && map[i][j] === 'b') {
                return false;
            }
        }
    }

    return true;
};

const click = (map, correct, targetI, targetJ) => {
    if (map[targetI][0].length === 0 || map[0][targetJ].length === 0) {
        return false;
    }

    if (map[targetI][targetJ] === 's' || map[targetI][targetJ] === 'b') {
        if (map[targetI][targetJ] === 's') {
            map[targetI][targetJ] = ' ';
        } else if (map[targetI][targetJ] === 'b') {
            map[targetI][targetJ] = '*';
        }

        if (map[targetI][targetJ] === correct) {
            let iDone = true;
            let jDone = true;

            for (const i in map) {
                for (const j in map[i]) {
                    if (correct === ' ' && map[i][j] === 's' || correct === '*' && map[i][j] === 'b') {
                        iDone &= parseInt(i, 10) !== targetI;
                        jDone &= parseInt(j, 10) !== targetJ;
                    }
                }
            }

            if (iDone) {
                map[targetI][0] = [];
            }

            if (jDone) {
                map[0][targetJ] = [];
            }
        }

        return true;
    }

    return false;
};

module.exports = {
    verify: verify,
    init: init,
    finished: finished,
    click: click,
};
