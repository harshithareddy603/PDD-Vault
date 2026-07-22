import postgres from 'postgres';
import fs from 'fs';

const sql = postgres('postgresql://postgres:Swathireddy@218@db.sxmtcytfvulqevyzfjbz.supabase.co:5432/postgres', {
  ssl: 'require',
  max: 1
});

async function run() {
  try {
    const query = `
      ALTER TABLE family_members DROP COLUMN IF EXISTS relation;
      ALTER TABLE family_members DROP COLUMN IF EXISTS age;
      ALTER TABLE family_members DROP COLUMN IF EXISTS blood_group;
      ALTER TABLE family_members DROP COLUMN IF EXISTS address;
      -- Notify postgrest to reload schema cache
      NOTIFY pgrst, 'reload schema';
    `;
    await sql.unsafe(query);
    console.log('Columns dropped successfully.');
  } catch (err) {
    console.error('Error executing schema:', err);
  } finally {
    await sql.end();
  }
}

run();
