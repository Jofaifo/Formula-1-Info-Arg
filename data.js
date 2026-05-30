window.drivers = [
    {
        slug: 'max-verstappen',
        position: 1,
        name: 'Max Verstappen',
        team: 'Red Bull Racing',
        teamSlug: 'red-bull-racing',
        points: 402,
        code: 'RB',
        colorClass: 'team-redbull',
        nationality: 'Holandés',
        age: 26,
        wins: 11,
        podiums: 18,
        bio: 'El multicampeón defensor dominó la temporada con un ritmo imparable y eficiencia en cada carrera.'
    },
    {
        slug: 'lewis-hamilton',
        position: 2,
        name: 'Lewis Hamilton',
        team: 'Mercedes-AMG',
        teamSlug: 'mercedes-amg',
        points: 336,
        code: 'ME',
        colorClass: 'team-mercedes',
        nationality: 'Británico',
        age: 38,
        wins: 5,
        podiums: 14,
        bio: 'Veterano de la parrilla, clasificado siempre entre los favoritos por su experiencia y consistencia.'
    },
    {
        slug: 'lando-norris',
        position: 3,
        name: 'Lando Norris',
        team: 'McLaren',
        teamSlug: 'mclaren',
        points: 298,
        code: 'MC',
        colorClass: 'team-mclaren',
        nationality: 'Británico',
        age: 25,
        wins: 3,
        podiums: 10,
        bio: 'El joven talento de McLaren brilló con carreras agresivas y un manejo impecable en condiciones mixtas.'
    },
    {
        slug: 'charles-leclerc',
        position: 4,
        name: 'Charles Leclerc',
        team: 'Ferrari',
        teamSlug: 'ferrari',
        points: 287,
        code: 'FE',
        colorClass: 'team-ferrari',
        nationality: 'Monegasco',
        age: 26,
        wins: 2,
        podiums: 11,
        bio: 'Con velocidad pura y estilo audaz, Leclerc llevó a Ferrari a múltiples podios durante la temporada.'
    },
    {
        slug: 'oscar-piastri',
        position: 5,
        name: 'Oscar Piastri',
        team: 'McLaren',
        teamSlug: 'mclaren',
        points: 254,
        code: 'MC',
        colorClass: 'team-mclaren',
        nationality: 'Australiano',
        age: 23,
        wins: 2,
        podiums: 7,
        bio: 'Rápido y preciso, el australiano consolidó a McLaren como uno de los equipos más fuertes.'
    },
    {
        slug: 'george-russell',
        position: 6,
        name: 'George Russell',
        team: 'Mercedes-AMG',
        teamSlug: 'mercedes-amg',
        points: 231,
        code: 'ME',
        colorClass: 'team-mercedes',
        nationality: 'Británico',
        age: 26,
        wins: 1,
        podiums: 9,
        bio: 'Consistente y resiliente, Russell mantuvo a Mercedes en la lucha por el campeonato de equipos.'
    },
    {
        slug: 'fernando-alonso',
        position: 7,
        name: 'Fernando Alonso',
        team: 'Aston Martin',
        teamSlug: 'aston-martin',
        points: 210,
        code: 'AM',
        colorClass: 'team-aston',
        nationality: 'Español',
        age: 44,
        wins: 1,
        podiums: 6,
        bio: 'Veterano imparable, Alonso probó una vez más su maestría en estrategia y resistencia en pista.'
    },
    {
        slug: 'sergio-perez',
        position: 8,
        name: 'Sergio Pérez',
        team: 'Red Bull Racing',
        teamSlug: 'red-bull-racing',
        points: 198,
        code: 'RB',
        colorClass: 'team-redbull',
        nationality: 'Mexicano',
        age: 34,
        wins: 1,
        podiums: 5,
        bio: 'Pérez aportó puntos clave para Red Bull con su experiencia en carrera y defensa estratégica.'
    },
    {
        slug: 'esteban-ocon',
        position: 9,
        name: 'Esteban Ocon',
        team: 'Alpine',
        teamSlug: 'alpine',
        points: 134,
        code: 'AL',
        colorClass: 'team-alpine',
        nationality: 'Francés',
        age: 28,
        wins: 0,
        podiums: 3,
        bio: 'Ocon mantuvo el ritmo y logró puntos sólidos en cada carrera con Alpine.'
    },
    {
        slug: 'alex-albon',
        position: 10,
        name: 'Alex Albon',
        team: 'Williams',
        teamSlug: 'williams',
        points: 102,
        code: 'WI',
        colorClass: 'team-williams',
        nationality: 'Tailandés',
        age: 28,
        wins: 0,
        podiums: 1,
        bio: 'Albon aportó constancia y desempeño competitivo en el retorno de Williams al top 10.'
    }
];

window.constructors = [
    {
        slug: 'red-bull-racing',
        position: 1,
        name: 'Red Bull Racing',
        points: 600,
        code: 'RB',
        colorClass: 'team-redbull',
        base: 'Milton Keynes, Reino Unido',
        teamPrincipal: 'Christian Horner',
        engine: 'Red Bull Powertrains',
        championships: 7,
        topDrivers: ['Max Verstappen', 'Sergio Pérez'],
        description: 'Registro dominante gracias a una mezcla de velocidad pura, pit stops precisos y estrategia agresiva.'
    },
    {
        slug: 'mercedes-amg',
        position: 2,
        name: 'Mercedes-AMG',
        points: 567,
        code: 'ME',
        colorClass: 'team-mercedes',
        base: 'Brackley, Reino Unido',
        teamPrincipal: 'Toto Wolff',
        engine: 'Mercedes',
        championships: 8,
        topDrivers: ['Lewis Hamilton', 'George Russell'],
        description: 'Equipo con experiencia y tecnología de punta que sigue luchando en la punta del campeonato.'
    },
    {
        slug: 'mclaren',
        position: 3,
        name: 'McLaren',
        points: 452,
        code: 'MC',
        colorClass: 'team-mclaren',
        base: 'Woking, Reino Unido',
        teamPrincipal: 'Andrea Stella',
        engine: 'Mercedes',
        championships: 8,
        topDrivers: ['Lando Norris', 'Oscar Piastri'],
        description: 'Renovado y veloz; McLaren volvió al podio gracias a una carrera constante y un auto competitivo.'
    },
    {
        slug: 'ferrari',
        position: 4,
        name: 'Ferrari',
        points: 398,
        code: 'FE',
        colorClass: 'team-ferrari',
        base: 'Maranello, Italia',
        teamPrincipal: 'Frédéric Vasseur',
        engine: 'Ferrari',
        championships: 16,
        topDrivers: ['Charles Leclerc'],
        description: 'Escudería histórica que sigue presionando con un paquete potente y tradición italiana.'
    },
    {
        slug: 'aston-martin',
        position: 5,
        name: 'Aston Martin',
        points: 326,
        code: 'AM',
        colorClass: 'team-aston',
        base: 'Silverstone, Reino Unido',
        teamPrincipal: 'Mike Krack',
        engine: 'Mercedes',
        championships: 0,
        topDrivers: ['Fernando Alonso'],
        description: 'El equipo sorprendió con un desarrollo sólido y un coche que rindió bien en varios circuitos.'
    },
    {
        slug: 'alpine',
        position: 6,
        name: 'Alpine',
        points: 189,
        code: 'AL',
        colorClass: 'team-alpine',
        base: 'Enstone, Reino Unido',
        teamPrincipal: 'Otmar Szafnauer',
        engine: 'Renault',
        championships: 1,
        topDrivers: ['Esteban Ocon'],
        description: 'Desempeño sólido con un coche que se muestra fiable y competitivo en las carreras difíciles.'
    },
    {
        slug: 'williams',
        position: 7,
        name: 'Williams',
        points: 144,
        code: 'WI',
        colorClass: 'team-williams',
        base: 'Grove, Reino Unido',
        teamPrincipal: 'James Vowles',
        engine: 'Mercedes',
        championships: 9,
        topDrivers: ['Alex Albon'],
        description: 'El regreso al top 10 refleja progreso en ingeniería y estrategia tras años de reconstrucción.'
    },
    {
        slug: 'haas',
        position: 8,
        name: 'Haas',
        points: 79,
        code: 'HA',
        colorClass: 'team-haas',
        base: 'Kannapolis, EE. UU.',
        teamPrincipal: 'Guenther Steiner',
        engine: 'Ferrari',
        championships: 0,
        topDrivers: ['Nico Hülkenberg'],
        description: 'Equipo estadounidense que siguió sumando puntos con un enfoque de desarrollo constante.'
    },
    {
        slug: 'alphatauri',
        position: 9,
        name: 'AlphaTauri',
        points: 53,
        code: 'AT',
        colorClass: 'team-alpha',
        base: 'Faenza, Italia',
        teamPrincipal: 'Franz Tost',
        engine: 'Honda',
        championships: 0,
        topDrivers: ['Yuki Tsunoda'],
        description: 'Equipo joven que explora talento y rendimiento con un coche competitivo en su clase.'
    },
    {
        slug: 'alfa-romeo',
        position: 10,
        name: 'Alfa Romeo',
        points: 46,
        code: 'AR',
        colorClass: 'team-alfa',
        base: 'Hinfada, Suiza',
        teamPrincipal: 'Frédéric Vasseur',
        engine: 'Ferrari',
        championships: 0,
        topDrivers: ['Valtteri Bottas'],
        description: 'Escudería establecida con un coche equilibrado, concentrada en sumar puntos carrera a carrera.'
    },
    {
        slug: 'cadillac-racing',
        position: 11,
        name: 'Cadillac Racing',
        points: 31,
        code: 'CD',
        colorClass: 'team-cadillac',
        base: 'Detroit, EE. UU.',
        teamPrincipal: 'Mary Barra',
        engine: 'Cadillac EV',
        championships: 0,
        topDrivers: ['Stella Schnabel'],
        description: 'Nueva escudería americana que marca presencia con diseño agresivo y tecnología eléctrica de última generación.'
    }
];

window.slugify = function (text) {
    return String(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

window.findDriverBySlug = function (slug) {
    return drivers.find(driver => driver.slug === slug);
};

window.findConstructorBySlug = function (slug) {
    return constructors.find(team => team.slug === slug);
};
