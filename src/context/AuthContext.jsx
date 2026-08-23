import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão ativa ao carregar
    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id, session.user.email);
        } else {
          // Checar se há uma sessão simulada salva no localStorage
          const localUser = localStorage.getItem('dino_doces_user');
          if (localUser) {
            const parsed = JSON.parse(localUser);
            setUser(parsed);
            setProfile(parsed.profile);
          }
        }
      } catch (err) {
        console.warn('Sessão Supabase não ativa ou offline:', err);
      } finally {
        setLoading(false);
      }
    }

    getInitialSession();

    // Escutar mudanças no Auth State
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('dino_doces_user');
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  async function loadUserProfile(userId, userEmail) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data);
      } else {
        const fallbackProfile = {
          id: userId,
          nome: userEmail ? userEmail.split('@')[0] : 'Cliente',
          email: userEmail,
          criado_em: new Date().toISOString()
        };
        setProfile(fallbackProfile);
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil do cliente:', err);
    }
  }

  async function login(email, password) {
    if (!email || !password) {
      throw new Error('Por favor, preencha o e-mail e a senha.');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Tratar erros comuns do Supabase
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('E-mail ou senha incorretos. Verifique suas credenciais.');
        }
        throw new Error(error.message);
      }

      setUser(data.user);
      await loadUserProfile(data.user.id, data.user.email);
      return data;
    } catch (err) {
      // Se o Supabase client estiver sem backend ativo, permitir login simulado para dev
      if (err.message.includes('FetchError') || err.message.includes('Failed to fetch')) {
        const mockUser = {
          id: 'client-simulated-id',
          email: email,
          profile: {
            id: 'client-simulated-id',
            nome: email.split('@')[0],
            email: email,
            criado_em: new Date().toISOString()
          }
        };
        setUser(mockUser);
        setProfile(mockUser.profile);
        localStorage.setItem('dino_doces_user', JSON.stringify(mockUser));
        return { user: mockUser };
      }
      throw err;
    }
  }

  async function cadastrar(nome, email, password, confirmPassword) {
    if (!nome || !email || !password || !confirmPassword) {
      throw new Error('Todos os campos são obrigatórios.');
    }

    if (password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres.');
    }

    if (password !== confirmPassword) {
      throw new Error('As senhas não coincidem. Digite a mesma senha nos dois campos.');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nome }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('Este e-mail já está cadastrado. Faça login ou use outro e-mail.');
        }
        throw new Error(error.message);
      }

      const newUser = data.user;
      if (newUser) {
        // Tentar salvar na tabela 'clientes'
        const newProfile = {
          id: newUser.id,
          nome: nome,
          email: email,
          criado_em: new Date().toISOString()
        };

        const { error: dbError } = await supabase
          .from('clientes')
          .insert([newProfile]);

        if (dbError) {
          console.warn('Erro ao inserir cliente no Supabase:', dbError);
        }

        setUser(newUser);
        setProfile(newProfile);
      }
      return data;
    } catch (err) {
      // Fallback para ambiente local se Supabase credentials não estiverem configuradas
      if (err.message.includes('FetchError') || err.message.includes('Failed to fetch')) {
        const mockUser = {
          id: 'client-' + Date.now(),
          email: email,
          profile: {
            id: 'client-' + Date.now(),
            nome: nome,
            email: email,
            criado_em: new Date().toISOString()
          }
        };
        setUser(mockUser);
        setProfile(mockUser.profile);
        localStorage.setItem('dino_doces_user', JSON.stringify(mockUser));
        return { user: mockUser };
      }
      throw err;
    }
  }

  async function recuperarSenha(email) {
    if (!email) {
      throw new Error('Por favor, informe seu e-mail de cadastro.');
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });

      if (error) throw new Error(error.message);
      return true;
    } catch (err) {
      if (err.message.includes('FetchError') || err.message.includes('Failed to fetch')) {
        return true; // Simular sucesso no fallback local
      }
      throw err;
    }
  }

  async function logout() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Erro ao desconectar:', err);
    } finally {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('dino_doces_user');
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        cadastrar,
        recuperarSenha,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
