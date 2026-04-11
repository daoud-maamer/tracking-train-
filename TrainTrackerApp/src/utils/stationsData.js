export const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const STATIONS_RAW = [
    { name: 'Gare de Tunis',    latitude: 36.795311, longitude: 10.180563, id: 0 },
    { name: 'G.D.F. Hached',    latitude: 36.7873048, longitude: 10.1788879, id: 1 },
    { name: 'Djebel Jelloud',   latitude: 36.7724962, longitude: 10.2040837, id: 2 },
    { name: 'Mégrine Riadh',   latitude: 36.7702698, longitude: 10.2201399, id: 3 },
    { name: 'Mégrine',          latitude: 36.7683269, longitude: 10.2294121, id: 4 },
    { name: 'Sidi Rezig',       latitude: 36.7672182, longitude: 10.2409349, id: 5 },
    { name: 'Radès Lycée',      latitude: 36.7667611, longitude: 10.2563696, id: 6 },
    { name: 'Radès',            latitude: 36.7683081, longitude: 10.2675813, id: 7 },
    { name: 'Radès Méliane',   latitude: 36.7638474, longitude: 10.2802198, id: 8 },
    { name: 'Ezzahra',          latitude: 36.7468667, longitude: 10.3022642, id: 9 },
    { name: 'Ezzahra Lycée',   latitude: 36.7410292, longitude: 10.3132506, id: 10 },
    { name: 'Boukornine',       latitude: 36.7350881, longitude: 10.3211148, id: 11 },
    { name: 'Hammam Lif',       latitude: 36.7301698, longitude: 10.3309961, id: 12 },
    { name: 'Arrêt du Stade',  latitude: 36.7253285, longitude: 10.3423043, id: 13 },
    { name: 'Tahar Sfar',       latitude: 36.7183456, longitude: 10.3565843, id: 14 },
    { name: 'Hammam Chott',     latitude: 36.7141659, longitude: 10.3666802, id: 15 },
    { name: 'Bir El Bey',       latitude: 36.7102676, longitude: 10.3742641, id: 16 },
    { name: 'Borj Cédria',     latitude: 36.7042123, longitude: 10.3942412, id: 17 },
    { name: 'Erriadh Station',  latitude: 36.7005737, longitude: 10.411182, id: 18 },
];

export const STATIONS = STATIONS_RAW.map((s, i) => ({
    ...s,
    distanceKm: i === 0
        ? 0
        : STATIONS_RAW.slice(0, i).reduce((acc, cur, j) =>
            acc + haversineKm(STATIONS_RAW[j].latitude, STATIONS_RAW[j].longitude,
                              STATIONS_RAW[j + 1].latitude, STATIONS_RAW[j + 1].longitude)
          , 0),
}));
