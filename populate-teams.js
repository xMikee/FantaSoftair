const { DataSource } = require('typeorm');
const crypto = require('crypto');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fanta_softair',
  entities: [
    'src/database/entities/*.entity.ts'
  ],
  synchronize: true,
});

const teamNames = [
  'Team Alpha', 'Team Bravo', 'Team Charlie', 'Team Delta', 'Team Echo',
  'Team Foxtrot', 'Team Golf', 'Team Hotel', 'Team India', 'Team Juliet',
  'Team Kilo', 'Team Lima', 'Team Mike', 'Team November', 'Team Oscar',
  'Squadra Leone', 'Squadra Tigre', 'Squadra Aquila', 'Squadra Falco', 'Squadra Lupo'
];

const playerNames = [
  'Marco Rossi', 'Luca Bianchi', 'Andrea Verdi', 'Matteo Neri', 'Davide Blu',
  'Francesco Giallo', 'Alessandro Rosa', 'Simone Viola', 'Roberto Grigio', 'Giuseppe Marrone',
  'Antonio Nero', 'Stefano Bianco', 'Federico Rosso', 'Lorenzo Verde', 'Riccardo Azzurro',
  'Michele Arancio', 'Fabio Viola', 'Paolo Rosa', 'Giovanni Oro', 'Nicola Argento',
  'Daniele Rame', 'Mattia Ferro', 'Cristian Acciaio', 'Emanuele Bronzo', 'Manuel Platino',
  'Gabriele Titanio', 'Claudio Zinco', 'Maurizio Alluminio', 'Vincenzo Piombo', 'Salvatore Stagno',
  'Tommaso Cobalto', 'Gianluca Nichel', 'Massimo Tungsteno', 'Diego Cromo', 'Sergio Manganese',
  'Alberto Molibdeno', 'Filippo Vanadio', 'Enrico Scandio', 'Mario Ittrio', 'Luigi Lantanio',
  'Franco Cerio', 'Carlo Praseodimio', 'Jacopo Neodimio', 'Edoardo Promezio', 'Alessio Samario',
  'Samuele Europio', 'Giacomo Gadolinio', 'Leonardo Terbio', 'Simone Disprosio', 'Matteo Olmio'
];

const positions = ['Assalto', 'Supporto', 'Ricognizione', 'Tiratore', 'Medico', 'Artificiere'];

function generateRandomPassword() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

function getRandomCredits() {
  return Math.floor(Math.random() * 500) + 750; // Random credits between 750-1250
}

function getRandomPoints() {
  return Math.floor(Math.random() * 1000); // Random points between 0-1000
}

function getRandomPlayerPoints() {
  return Math.floor(Math.random() * 200); // Random player points between 0-200
}

function getRandomBaseValue() {
  return Math.floor(Math.random() * 100) + 50; // Random base value between 50-150
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function populateTeams() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const userRepository = AppDataSource.getRepository('User');
    const playerRepository = AppDataSource.getRepository('Player');

    // Clear existing data
    console.log('Clearing existing teams and players...');
    await playerRepository.delete({});
    await userRepository.delete({});

    const shuffledPlayerNames = shuffleArray(playerNames);
    let playerIndex = 0;

    // Create teams
    for (let i = 0; i < teamNames.length; i++) {
      const teamName = teamNames[i];
      
      // Create team (user)
      const team = await userRepository.save({
        name: teamName,
        credits: getRandomCredits(),
        totalPoints: getRandomPoints(),
        teamPassword: generateRandomPassword()
      });

      console.log(`Created team: ${teamName} (ID: ${team.id}) with password: ${team.teamPassword}`);

      // Create 10-15 players per team
      const playersPerTeam = Math.floor(Math.random() * 6) + 10; // 10-15 players
      const teamPlayers = [];

      for (let j = 0; j < playersPerTeam; j++) {
        if (playerIndex >= shuffledPlayerNames.length) {
          // If we run out of unique names, start adding numbers
          const baseName = playerNames[Math.floor(Math.random() * playerNames.length)];
          shuffledPlayerNames.push(`${baseName} ${Math.floor(Math.random() * 100)}`);
        }

        const player = await playerRepository.save({
          name: shuffledPlayerNames[playerIndex],
          baseValue: getRandomBaseValue(),
          currentPoints: getRandomPlayerPoints(),
          yearlyPoints: getRandomPlayerPoints() * 2,
          position: positions[Math.floor(Math.random() * positions.length)],
          owner: team,
          ownerId: team.id,
          isInFormation: false,
          selectedForLineup: false
        });

        teamPlayers.push(player);
        playerIndex++;
      }

      // Randomly select 8 players for formation
      const shuffledTeamPlayers = shuffleArray(teamPlayers);
      const formationPlayers = shuffledTeamPlayers.slice(0, 8);
      
      for (const player of formationPlayers) {
        await playerRepository.update(player.id, { isInFormation: true });
      }

      console.log(`  Added ${playersPerTeam} players (${formationPlayers.length} in formation)`);
    }

    console.log('\n=== TEAM SUMMARY ===');
    const teams = await userRepository.find({ relations: ['players'] });
    
    for (const team of teams) {
      const formationCount = team.players.filter(p => p.isInFormation).length;
      console.log(`${team.name}:`);
      console.log(`  Password: ${team.teamPassword}`);
      console.log(`  Credits: ${team.credits}`);
      console.log(`  Total Points: ${team.totalPoints}`);
      console.log(`  Players: ${team.players.length} (${formationCount} in formation)`);
      console.log('');
    }

    console.log(`Successfully created ${teams.length} teams with a total of ${playerIndex} players!`);

  } catch (error) {
    console.error('Error populating teams:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
populateTeams();