import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://grioptjvrijkihdhfcku.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyaW9wdGp2cmlqa2loZGhmY2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzYxNTYsImV4cCI6MjA2MTgxMjE1Nn0.wy9d2orWlx6zut_TNybDHZbECC1Gl569HI0D9rP6cS0"
);

function App() {
  useEffect(() => {
    supabase.auth.getSession()
      .then(console.log)
      .catch(console.error)
      .finally(() => console.log('done'));
  }, []);
  return <div>Test Supabase getSession</div>;
}

export default App;