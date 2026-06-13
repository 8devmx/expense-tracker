import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export const auth = {
  googleSignIn: () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + (import.meta.env.PROD ? '/expense-tracker' : '') },
    }),
  emailSignIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),
  emailSignUp: (email, password, name) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    }),
  signOut: () => supabase.auth.signOut(),
  getUser: () => supabase.auth.getUser(),
  getSession: () => supabase.auth.getSession(),
  onAuthChange: (cb) => supabase.auth.onAuthStateChange(cb),
}

export const categoriesApi = {
  list: () =>
    supabase.from('categories').select('*').order('name'),
  create: async (data) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    return supabase.from('categories').insert({ ...data, user_id: user.id }).select().single()
  },
  update: (id, data) =>
    supabase.from('categories').update(data).eq('id', id).select().single(),
  remove: (id) =>
    supabase.from('categories').delete().eq('id', id),
}

export const transactionsApi = {
  listMonthly: async (year, month) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    return supabase.rpc('get_monthly_transactions', {
      p_user_id: user.id, p_year: year, p_month: month,
    })
  },
  listYear: async (year) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    return supabase.rpc('get_year_transactions', {
      p_user_id: user.id, p_year: year,
    })
  },
  create: async (data) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    return supabase.from('transactions').insert({ ...data, user_id: user.id }).select().single()
  },
  update: (id, data) =>
    supabase.from('transactions').update(data).eq('id', id).select().single(),
  remove: (id) =>
    supabase.from('transactions').delete().eq('id', id),
}

export const settingsApi = {
  get: () =>
    supabase.from('user_settings').select('*').single(),
  update: (data) =>
    supabase.from('user_settings').update(data).select().single(),
}
