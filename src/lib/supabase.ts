import { createClient } from '@supabase/supabase-js'
import { Database } from '../database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// O cliente agora é "tipado". O VS Code sabe tudo sobre o seu banco!
export const supabase = createClient<Database>(supabaseUrl, supabaseKey)