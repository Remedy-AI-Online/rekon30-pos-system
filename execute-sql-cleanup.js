import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const infoPath = path.join(__dirname, 'src', 'utils', 'supabase', 'info.tsx')
const infoContent = fs.readFileSync(infoPath, 'utf8')

const projectIdMatch = infoContent.match(/projectId\s*=\s*["']([^"']+)["']/)
const projectId = projectIdMatch[1]
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_URL = `https://${projectId}.supabase.co`

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

console.log('\n🔄 Starting database cleanup...\n')

async function executeSQL() {
  try {
    // Delete sales
    console.log('🗑️  Deleting sales...')
    const { error: salesError } = await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (salesError) console.log(`   ⚠️  ${salesError.message}`)
    else console.log('   ✅ Sales deleted')

    // Delete payroll
    console.log('🗑️  Deleting payroll...')
    const { error: payrollError } = await supabase.from('payroll').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (payrollError) console.log(`   ⚠️  ${payrollError.message}`)
    else console.log('   ✅ Payroll deleted')

    // Delete workers
    console.log('🗑️  Deleting workers...')
    const { error: workersError } = await supabase.from('workers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (workersError) console.log(`   ⚠️  ${workersError.message}`)
    else console.log('   ✅ Workers deleted')

    // Delete customers
    console.log('🗑️  Deleting customers...')
    const { error: customersError } = await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (customersError) console.log(`   ⚠️  ${customersError.message}`)
    else console.log('   ✅ Customers deleted')

    // Delete products
    console.log('🗑️  Deleting products...')
    const { error: productsError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (productsError) console.log(`   ⚠️  ${productsError.message}`)
    else console.log('   ✅ Products deleted')

    // Delete locations
    console.log('🗑️  Deleting locations...')
    const { error: locationsError } = await supabase.from('locations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (locationsError) console.log(`   ⚠️  ${locationsError.message}`)
    else console.log('   ✅ Locations deleted')

    // Delete business feature log
    console.log('🗑️  Deleting business feature log...')
    const { error: featureLogError } = await supabase.from('business_feature_log').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (featureLogError) console.log(`   ⚠️  ${featureLogError.message}`)
    else console.log('   ✅ Feature log deleted')

    // Delete backup records
    console.log('🗑️  Deleting backup records...')
    const { error: backupsError } = await supabase.from('backup_records').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (backupsError) console.log(`   ⚠️  ${backupsError.message}`)
    else console.log('   ✅ Backup records deleted')

    // Delete payments
    console.log('🗑️  Deleting payments...')
    const { error: paymentsError } = await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (paymentsError) console.log(`   ⚠️  ${paymentsError.message}`)
    else console.log('   ✅ Payments deleted')

    // Delete businesses
    console.log('🗑️  Deleting businesses...')
    const { error: businessesError } = await supabase.from('businesses').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (businessesError) console.log(`   ⚠️  ${businessesError.message}`)
    else console.log('   ✅ Businesses deleted')

    console.log('\n' + '='.repeat(50))
    console.log('✅ Database cleanup complete!')
    console.log('='.repeat(50))

    // Verification
    console.log('\n📊 Verification:')
    const { count: businessCount } = await supabase.from('businesses').select('*', { count: 'exact', head: true })
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
    const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true })
    const { count: salesCount } = await supabase.from('sales').select('*', { count: 'exact', head: true })

    console.log(`   Businesses: ${businessCount}`)
    console.log(`   Products: ${productCount}`)
    console.log(`   Customers: ${customerCount}`)
    console.log(`   Sales: ${salesCount}`)

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

executeSQL().then(() => {
  console.log('\n✨ All done!\n')
  process.exit(0)
})

