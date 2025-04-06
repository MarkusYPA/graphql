export function roundToOneSignificantNumber(num) {

    let mult = 1;
    if (num < 0) {
        num *= -1;
        mult = -1;
    }

    let numbersLong = 0;
    while (num >= 1) {
        num /= 10;
        numbersLong++;
    }

    return Math.floor(num * 10) * 10 ** (numbersLong - 1) * mult;
}