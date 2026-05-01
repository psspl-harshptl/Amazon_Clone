const { User } = require('./backend/models');

async function checkUser() {
  try {
    const user = await User.findOne({ where: { email: 'harsh@example.com' } });
    if (user) {
      console.log('User found:', user.toJSON());
    } else {
      console.log('User NOT found');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

checkUser();
