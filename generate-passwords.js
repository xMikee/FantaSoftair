const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Function to generate random password
function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 6; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Connect to database
const dbPath = path.join(__dirname, 'data', 'fanta-softair.db');
const db = new sqlite3.Database(dbPath);

console.log('🔐 Generating random passwords for all users...\n');

// Get all users and generate passwords
db.all('SELECT id, name, password FROM users', [], (err, rows) => {
    if (err) {
        console.error('Error fetching users:', err);
        return;
    }

    console.log('Users and their passwords:');
    console.log('========================');

    let updates = 0;
    const totalUsers = rows.length;

    rows.forEach((user) => {
        const password = generateRandomPassword();
        
        db.run('UPDATE users SET password = ? WHERE id = ?', [password, user.id], (err) => {
            if (err) {
                console.error(`Error updating password for ${user.name}:`, err);
            } else {
                console.log(`👤 ${user.name.padEnd(25)} | Password: ${password}`);
                updates++;
                
                if (updates === totalUsers) {
                    console.log('\n✅ All passwords generated successfully!');
                    console.log('\n📋 Share these passwords with the respective users.');
                    console.log('💡 Users can change their passwords later from the app.');
                    db.close();
                }
            }
        });
    });
});