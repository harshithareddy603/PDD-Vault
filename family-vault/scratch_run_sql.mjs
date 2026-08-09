import postgres from 'postgres';

const sql = postgres('postgresql://postgres:Swathireddy@218@db.sxmtcytfvulqevyzfjbz.supabase.co:5432/postgres', {
  ssl: 'require',
  max: 1
});

async function run() {
  try {
    console.log('Adding document_number column to documents table...');
    await sql.unsafe(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_number text;`);
    console.log('Added document_number column.');

    await sql.unsafe(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS source text;`);
    console.log('Added source column.');

    await sql.unsafe(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_hash text;`);
    console.log('Added file_hash column.');

    console.log('Reloading PostgREST schema cache...');
    await sql.unsafe(`NOTIFY pgrst, 'reload schema';`);
    console.log('PostgREST schema cache reloaded successfully!');
  } catch (err) {
    console.error('Error executing schema update:', err);
  } finally {
    await sql.end();
  }
}

run();
