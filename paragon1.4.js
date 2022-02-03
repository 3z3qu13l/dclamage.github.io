'use strict';

const getJSON = (url, callback) => {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Accept', 'application/json');
    request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
            return callback(JSON.parse(request.response));
        }
    };
    request.send();
}

const paragons = [];
const LoadParagon = callback => {
    return getJSON('ressources/paragontotals.json', data => {
        for (let i = 0; i < 2252; i++) {
            paragons.push(BigNumber(data[i]));
        }
        if (callback) return callback();
    });
}

const c1 = BigNumber(166105421028000);
const c2 = BigNumber(201211626000);
const c3 = BigNumber(229704000);
const c4 = BigNumber(102000);
const half = BigNumber(0.5);
const six = BigNumber(6);
const GetParagonLevelXP = level => {
    if (isNaN(level) || level <= 0) return paragons[0];
    if (level < 2252) return paragons[level];

    const x = BigNumber(level - 2252);
    const xp1 = BigNumber(level - 2251);
    const xp2 = BigNumber(level - 2250);
    return c1.plus(c2.multipliedBy(x).plus(c3.multipliedBy((x.multipliedBy(xp1).multipliedBy(half))).plus((x.multipliedBy(xp1).multipliedBy(xp2).dividedBy(six)) * c4)))
}

const DiffParagon = (a, b) => GetParagonLevelXP(Math.max(a, b)).minus(GetParagonLevelXP(Math.min(a, b)));

const GetParagonLevel = xp => {
    let l = 0;
    let h = 1;
    while (GetParagonLevelXP(h).isLessThan(xp)) {
        l = h;
        h *= 2;
    }
    while (l < h) {
        const mid = Math.floor((l + h) / 2);
        const midXP = GetParagonLevelXP(mid);
        if (xp.isLessThanOrEqualTo(midXP)) {
            h = mid;
        } else {
            l = mid + 1;
        }
    }
    return l;
}

const ScaleXP = (xp, level) => {
    if (level <= 25) return xp.multipliedBy(Math.pow(1.127, level - 1));
    if (level <= 70) return xp.multipliedBy(Math.pow(1.127, 24) * Math.pow(1.08, level - 25));

    return xp.multipliedBy(Math.pow(1.127, 24) * Math.pow(1.08, 70 - 25) * Math.pow(1.05, level - 70));
}

const baseRiftXP = BigNumber(11794543);
const GetRiftXP = level => ScaleXP(baseRiftXP, level);

const baseCloseXP = BigNumber(15667533);
const GetCloseXP = level => ScaleXP(baseCloseXP, level);
