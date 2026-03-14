import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseStorage<T>(key: string, initialValue: T) {
  // Read from local storage first for immediate render
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Fetch latest from Supabase on mount
  useEffect(() => {
    const fetchFromSupabase = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('app_state')
          .select('data')
          .eq('id', `${user.id}_${key}`)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error(`Error fetching from Supabase for key "${key}":`, error);
          }
          return;
        }

        if (data && data.data) {
          const fetchedData = data.data as T;
          setStoredValue(fetchedData);
          window.localStorage.setItem(key, JSON.stringify(fetchedData));
        }
      } catch (error) {
        console.error(`Error in fetchFromSupabase for key "${key}":`, error);
      }
    };

    fetchFromSupabase();
  }, [key]);

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update local state immediately for snappy UI
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Sync to Supabase in the background
      const { error } = await supabase
        .from('app_state')
        .upsert({ 
          id: `${user.id}_${key}`,
          user_id: user.id,
          data: valueToStore, 
          updated_at: new Date().toISOString() 
        });

      if (error) {
        console.error(`Error syncing to Supabase for key "${key}":`, error);
      }
    } catch (error) {
      console.warn(`Error setting value for key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
