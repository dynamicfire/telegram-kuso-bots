'use strict';

const config = require('./config');
const bot = require('./bot.' + config.bot)(config.abToken);

const core = require('./1a2b.core');

process.on('uncaughtException', (err) => {
    console.error(err);
});

const games = {};

const event = (handler) => {
    return (msg, match) => {
        console.log('[' + Date() + '] ' + msg.chat.id + ':' + msg.from.id + '@' + (msg.from.username || '') + ' ' + match[0]);

        if (!config.ban[msg.from.id]) {
            handler(msg, match);
        }
    };
};

const gameEvent = event((msg, match) => {
    const game = games[msg.chat.id];

    if (game.guess['#' + match[0]]) {
        return bot.sendMessage(
            msg.chat.id,
            '已经猜过啦',
            {
                reply_to_message_id: msg.message_id,
            }
        );
    } else {
        game.guess['#' + match[0]] = core.getAB(match[0], game.answer);

        let list = '当前猜测：';

        for (const text in guess) {
            list += '\n' + text.slice(1) + ' ' + guess[text][0] + 'A' + guess[text][1] + 'B';
        }

        if (game.guess['#' + match[0]][0] === game.answer.length) {
            delete games[msg.chat.id];

            return bot.sendMessage(
                msg.chat.id,
                '猜对啦！答案是：\n'
                    + game.answer,
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        } else {
            return bot.sendMessage(
                msg.chat.id,
                list,
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        }
    }
});

bot.onText(/^\w+$/, (msg, match) => {
    if (games[msg.chat.id]) {
        const game = games[msg.chat.id];

        if (game.answer) {
            if (match[0].length === game.answer.length && core.removeChar(match[0], game.charset) === '') {
                gameEvent(msg, match);
            }
        } else {
            if (match[0].length <= config.abMaxLength && core.removeChar(match[0], game.charset) === '') {
                game.answer = core.shuffle(game.charset, match[0].length);
                gameEvent(msg, match);
            }
        }
    }
});

bot.onText(/^\/1a2b(@\w+)?(?: (\w+))?$/, event((msg, match) => {
    if (games[msg.chat.id]) {
        return bot.sendMessage(
            msg.chat.id,
            '已经开始啦',
            {
                reply_to_message_id: msg.message_id,
            }
        );
    } else {
        if (!match[2]) {
            match[2] = '1234567890';
        }

        games[msg.chat.id] = {
            charset: match[2],
            answer: null,
            guess: {},
        }

        return bot.sendMessage(
            msg.chat.id,
            '游戏开始啦，目标字符集：\n'
                + match[2] + '\n'
                + '将根据第一次猜测决定答案长度',
            {
                reply_to_message_id: msg.message_id,
            }
        );
    }
}));

bot.onText(/^\/0a0b(@\w+)?$/, event((msg, match) => {
    if (games[msg.chat.id]) {
        const game = games[msg.chat.id];

        delete games[msg.chat.id];

        if (game.answer) {
            return bot.sendMessage(
                msg.chat.id,
                '游戏结束啦，答案是：\n'
                    + game.answer,
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        } else {
            return bot.sendMessage(
                msg.chat.id,
                '游戏结束啦',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        }
    } else {
        return bot.sendMessage(
            msg.chat.id,
            '不存在的！',
            {
                reply_to_message_id: msg.message_id,
            }
        );
    }
}));