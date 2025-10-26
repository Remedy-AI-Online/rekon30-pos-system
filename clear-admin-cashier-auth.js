/**
 * Clear All Admin and Cashier Authentication
 * This script removes all admin and cashier users from Supabase Auth
 * Super Admin accounts remain intact
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read Supabase credentials from info.tsx
const infoPath = path.join(__dirname, 'src', 'utils', 'supabase', 'info.tsx')
const infoContent = fs.readFileSync(infoPath, 'utf8')

const projectIdMatch = infoContent.match(/projectId\s*=\s*["']([^"']+)["']/)
const publicKeyMatch = infoContent.match(/publicAnonKey\s*=\s*["']([^"']+)["']/)

if (!projectIdMatch || !publicKeyMatch) {
  console.error('❌ Could not extract Supabase credentials from info.tsx')
  process.exit(1)
}

const projectId = projectIdMatch[1]
const publicAnonKey = publicKeyMatch[1]

console.log('📋 Project ID:', projectId)

// You need to provide the SERVICE_ROLE_KEY as an environment variable
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Please set SUPABASE_SERVICE_ROLE_KEY environment variable')
  console.log('\n💡 Usage:')
  console.log('   set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  console.log('   node clear-admin-cashier-auth.js')
  console.log('\n📍 Get your service role key from:')
  console.log(`   https://supabase.com/dashboard/project/${projectId}/settings/api`)
  process.exit(1)
}

const SUPABASE_URL = `https://${projectId}.supabase.co`

// Create admin client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function clearAdminCashierAuth() {
  console.log('\n🔄 Starting to clear admin and cashier authentication...\n')

  try {
    // Step 1: Get all auth users
    console.log('📊 Fetching all auth users...')
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Error listing users:', listError.message)
      return
    }

    console.log(`✅ Found ${users.length} total users\n`)

    // Step 2: Filter and delete admin/cashier users
    let deletedCount = 0
    let skippedCount = 0

    for (const user of users) {
      const role = user.user_metadata?.role || 'unknown'
      const email = user.email || 'no-email'

      // Skip super_admin users
      if (role === 'super_admin') {
        console.log(`⏭️  Skipping Super Admin: ${email}`)
        skippedCount++
        continue
      }

      // Delete admin and cashier users
      if (role === 'admin' || role === 'cashier') {
        console.log(`🗑️  Deleting ${role}: ${email}`)
        
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
          console.error(`   ❌ Failed to delete: ${deleteError.message}`)
        } else {
          console.log(`   ✅ Deleted successfully`)
          deletedCount++
        }
      } else {
        console.log(`⚠️  Unknown role '${role}' for user: ${email} - Skipping`)
        skippedCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 Summary:')
    console.log(`   Total users processed: ${users.length}`)
    console.log(`   Deleted: ${deletedCount}`)
    console.log(`   Skipped (Super Admin + Unknown): ${skippedCount}`)
    console.log('='.repeat(50))

    console.log('\n✅ Authentication cleanup complete!')
    console.log('\n💡 Next step: Run the SQL script to clear database data')
    console.log('   supabase db push --include-seed clear-admin-cashier-data.sql')

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

// Run the cleanup
clearAdminCashierAuth()
  .then(() => {
    console.log('\n✨ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })

