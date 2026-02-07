// Helper for darkening color
export function adjustBrightness(hex: string, percent: number) {
    if(!hex) return '#000000';
    hex = hex.replace(/^\s*#|\s*$/g, '');
    if (hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
    }
    var r = parseInt(hex.substring(0, 2), 16),
        g = parseInt(hex.substring(2, 4), 16),
        b = parseInt(hex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';

    if (percent > 0) {
        r += (255 - r) * percent / 100;
        g += (255 - g) * percent / 100;
        b += (255 - b) * percent / 100;
    } else {
        r += r * percent / 100;
        g += g * percent / 100;
        b += b * percent / 100;
    }

    // Clamp values
    r = Math.min(255, Math.max(0, Math.round(r)));
    g = Math.min(255, Math.max(0, Math.round(g)));
    b = Math.min(255, Math.max(0, Math.round(b)));

    var RR = ((r.toString(16).length === 1) ? "0" + r.toString(16) : r.toString(16));
    var GG = ((g.toString(16).length === 1) ? "0" + g.toString(16) : g.toString(16));
    var BB = ((b.toString(16).length === 1) ? "0" + b.toString(16) : b.toString(16));

    return "#" + RR + GG + BB;
}