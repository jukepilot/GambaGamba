function source() {
    var balanceElement = document.getElementById("balance");
    var slot_1 = document.getElementById("slot_1");
    var slot_2 = document.getElementById("slot_2");
    var slot_3 = document.getElementById("slot_3");
    var message_label = document.getElementById("message_label");
    var gamble_amount = document.getElementById("gamble_amount");
    var gamble_button = document.getElementById("gamble_button");

    var messages = {
        "Win25": "YOU WON 25X HOLY MOLY!!",
        "Win8": "You won 8x good job!",
        "Win3": "3x pretty good!",

        "Lose": "Unlucky :( Try again?",

        "Entice": "Are you feeling lucky?",
        "Rolling": "ROLLING",

        "Cheating": "ok ok ok. what the sigma?",
    }

    var balance = 0

    function updateBalanceText() {
        balanceElement.innerHTML = "BALANCE: $" + balance
    }

    function save_data() {
        chrome.storage.sync.set({ "game_data": { balance: balance } })
    }

    function get_data() {
        chrome.storage.sync.get("game_data", function (result) {
            var data = result.game_data
            if (data) {
                balance = data.balance
            } else {
                balance = 150
                save_data()
            }
            
            updateBalanceText()
        })
    }

    get_data()

    window.onblur = function () {
        save_data()
    }

    setInterval(function () {
        balance += 50
        updateBalanceText()
        save_data()
    }, 10000)

    function getNums() {
        var d1 = Math.floor(Math.random() * 7) + 1
        var d2 = Math.floor(Math.random() * 7) + 1
        var d3 = Math.floor(Math.random() * 7) + 1

        return [d1, d2, d3];
    }

    function getWin(digit_1, digit_2, digit_3) {
        var multiplier = 1;
        var win = true;

        if (digit_1 == digit_2 && digit_2 == digit_3 && digit_1 != 7) {
            // All 3 not 7s

            multiplier = 8;
        } else if (digit_1 == digit_2 && digit_2 == digit_3 && digit_1 == 7) {
            // All 3 7s

            multiplier = 25;
        } else if (digit_1 == digit_2 && digit_1 != 7) {
            // First 2 not 7s

            multiplier = 3;
        } else if (digit_1 == digit_2 && digit_1 == 7) {
            // First 2 7s

            multiplier = 8;
        } else if (digit_2 == digit_3 && digit_2 != 7) {
            // Last 2 not 7s

            multiplier = 3;
        } else if (digit_2 == digit_3 && digit_2 == 7) {
            // Last 2 7s

            multiplier = 8;
        } else if (digit_1 == digit_3 && digit_2 != 7) {
            // Outer 2 not 7s

            multiplier = 3;
        } else if (digit_1 == digit_3 && digit_1 == 7) {
            // Outer 2s 7s

            multiplier = 8;
        } else {
            // Lost

            win = false
            multiplier = 1;
        }

        return [win, multiplier]
    }

    message_label.innerHTML = messages["Entice"]

    gamble_button.addEventListener("click", function (event) {
        if (!event.isTrusted || (event.screenX == 0 && event.screenY == 0 && event.clientX == 0 && event.clientY == 0)) {
            message_label.innerHTML = messages["Cheating"]
            event.preventDefault();
        } else {
            if (balance < gamble_amount.value || gamble_amount.value < 1) {
                return
            }
            var desposit = gamble_amount.value
            balance -= desposit
            updateBalanceText()
            save_data()

            gamble_button.style.pointerEvents = "none"
            gamble_amount.style.pointerEvents = "none"

            var [d1, d2, d3] = getNums();
            var [win, multiplier] = getWin(d1, d2, d3);

            slot_1.innerHTML = ""
            slot_2.innerHTML = ""
            slot_3.innerHTML = ""
            // message_label.innerHTML = "["+messages["Rolling"]+"]"

            var num = 0

            var num_interval = setInterval(function () {
                if (num == 8) {
                    num = 1
                } else {
                    num++
                }
            }, 10)

            var numString = 0
            var startString = "-"
            var goalString = messages["Rolling"]

            var rolling_interval = setInterval(function () {
                var dashes = startString.repeat(6 - numString)
                var goal = goalString.substring(0, numString + 1)

                message_label.innerHTML = "[" + goal + dashes + "]"

                numString++
            }, 214.285714)

            var slot_1_interval = setInterval(function () {
                slot_1.innerHTML = num
            }, 10)
            var slot_2_interval = setInterval(function () {
                slot_2.innerHTML = num
            }, 10)
            var slot_3_interval = setInterval(function () {
                slot_3.innerHTML = num
            }, 10)

            setTimeout(function () {
                clearInterval(slot_1_interval)
                slot_1.innerHTML = d1
            }, 500)
            setTimeout(function () {
                clearInterval(slot_2_interval)
                slot_2.innerHTML = d2
            }, 1000)
            setTimeout(function () {
                clearInterval(slot_3_interval)
                clearInterval(num_interval)
                clearInterval(rolling_interval)
                slot_3.innerHTML = d3
            }, 1500)
            setTimeout(function () {
                if (win) {
                    balance += (desposit * multiplier)
                    updateBalanceText()
                    save_data()
                }
                message_label.innerHTML = messages[win && "Win" + multiplier || "Lose"]
            }, 2000)
            setTimeout(function () {
                gamble_button.style.pointerEvents = "auto"
                gamble_amount.style.pointerEvents = "auto"
            }, 3000)
        }
    })
}

window.addEventListener("DOMContentLoaded", source);