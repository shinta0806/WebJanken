// ============================================================================
// 
// ユリウス日を計算するクラス
// 
// ============================================================================

// ----------------------------------------------------------------------------
// C# 版から移植
// ----------------------------------------------------------------------------

class julianDay {
    // DateTime→（修正じゃない）ユリウス日
    static dateTimeToJulianDay(dateTime) {
        return (dateTime.getTime() + (this.julianBase * this.tickPerDay)) / this.tickPerDay;
    }

    // DateTime→修正ユリウス日
    static dateTimeToModifiedJulianDate(dateTime) {
        return this.dateTimeToJulianDay(dateTime) - this.mjdDelta;
    }

    // （修正じゃない）ユリウス日→DateTime
    static julianDayToDateTime(julianDay) {
        return new Date((julianDay - this.julianBase) * this.tickPerDay);
    }

    // 修正ユリウス日→DateTime
    static modifiedJulianDateToDateTime(mjd) {
        return this.julianDayToDateTime(mjd + this.mjdDelta);
    }

    // 1 日を Ticks（1 ミリ秒）で表した数値
    static tickPerDay = 24 * 60 * 60 * 1000;

    // ECMAScript 元期（1970/01/01 00:00）をユリウス日で表した数値
    static julianBase = 2440587.5;

    // 修正ユリウス日 = ユリウス通日 - mjdDelta
    static mjdDelta = 2400000.5;
}

module.exports = julianDay;
