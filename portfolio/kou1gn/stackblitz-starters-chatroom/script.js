  // INITIALIZE SUPABASE
  const SUPABASE_URL = 'https://ucmcrelntivvzxywiudg.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_xurqceZWPL4W-m7YriwjJg_TTct6wVw';
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const messageContainer = document.getElementById('messages');
  const chatForm = document.getElementById('input-area');

  // 1. Fetch existing messages
  async function fetchMessages() {
      const { data } = await supabaseClient.from('messages').select('*').order('created_at', { ascending: true });
      data?.forEach(appendMessage);
  }

  // 2. Append message to UI
  function appendMessage(msg) {
      const div = document.createElement('div');
      div.className = 'msg';
      div.innerHTML = `<b>${msg.username}</b> ${msg.content}`;
      messageContainer.appendChild(div);
      messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  // 3. Send message to Database
  chatForm.onsubmit = async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value || 'Anon';
      const content = document.getElementById('messageInput').value;
      
      if (content) {
          await supabaseClient.from('messages').insert([{ username, content }]);
          document.getElementById('messageInput').value = '';
      }
  };

  // 4. Listen for Realtime changes
  supabaseClient
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          appendMessage(payload.new);
      })
      .subscribe();

  fetchMessages();