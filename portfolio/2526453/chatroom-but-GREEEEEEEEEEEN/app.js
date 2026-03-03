const _supabaseUrl = 'https://zmrssrvnckzitazellaj.supabase.co';
const _supabaseKey = 'sb_publishable_USdXvOBZ-cmnEK02EXuv4A_aFn7K-NN';
const supabaseClient = supabase.createClient(_supabaseUrl, _supabaseKey);

const chatBox = document.getElementById('chat-box');
const contentInput = document.getElementById('content');
const usernameInput = document.getElementById('username');
const imageInput = document.getElementById('image-input');
const sendBtn = document.getElementById('send-btn');
const mainContainer = document.querySelector('.main-container');

// 1. Fetch existing messages
async function fetchMessages() {
    const { data, error } = await supabaseClient
        .from('messages') // Fixed table name to match your description
        .select('*')
        .order('created_at', { ascending: true });

    if (error) console.error('Error fetching:', error);
    else data.forEach(appendMessage);
}

// 2. Main Send Logic
sendBtn.addEventListener('click', async () => {
    const username = usernameInput.value || 'STALKER';
    const content = contentInput.value;
    const file = imageInput.files[0];
    let publicImageUrl = null;

    if (!content && !file) return; // Don't send empty messages

    try {
        // Upload image if selected
        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabaseClient
                .storage
                .from('chat_images') // Using your actual bucket name
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabaseClient
                .storage
                .from('chat_images')
                .getPublicUrl(fileName);
            
            publicImageUrl = urlData.publicUrl;
        }

        // Insert message
        const { error: insertError } = await supabaseClient
            .from('messages')
            .insert([{ 
                username: username, 
                content: content, 
                image_url: publicImageUrl 
            }]);

        if (insertError) throw insertError;

        // Clear UI
        contentInput.value = '';
        imageInput.value = '';

    } catch (err) {
        console.error("Transmission Failed:", err.message);
        alert("VOID ERROR: " + err.message);
    }
});

// 3. Realtime Listener
supabaseClient
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        appendMessage(payload.new);
    })
    .subscribe();

// 4. Render Message
function appendMessage(msg) {
    const div = document.createElement('div');
    div.className = 'msg';
    
    let imgTag = '';
    if (msg.image_url) {
        imgTag = `<br><img src="${msg.image_url}" style="max-width:100%; border:1px solid #0f0; margin-top:10px;">`;
    }

    div.innerHTML = `<span class="user glitch-text">${msg.username}:</span> ${msg.content} ${imgTag}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    triggerGlitch();
}

function triggerGlitch() {
    mainContainer.classList.add('shake-trigger');
    setTimeout(() => mainContainer.classList.remove('shake-trigger'), 300);
}

fetchMessages();

// Function to temporarily change the void's color
function triggerColorShift(color) {
    const originalColor = "#00ff00"; // Your matrix green
    
    // Change the main variables
    document.documentElement.style.setProperty('--main-theme', color);
    document.body.style.borderColor = color;
    document.querySelector('.main-container').style.borderColor = color;
    
    // Select all elements that use the green color and override them
    const themedElements = document.querySelectorAll('button, input, #chat-box, .msg, .user');
    themedElements.forEach(el => {
        el.style.color = color;
        el.style.borderColor = color;
        if (el.tagName === 'BUTTON') el.style.backgroundColor = color;
    });

    // Revert after 10 seconds
    setTimeout(() => {
        document.documentElement.style.setProperty('--main-theme', originalColor);
        // Reloading or manually resetting styles
        location.reload(); // Simplest way to "clean" the hacky style overrides
    }, 10000);
}
// sendBtn.addEventListener('click', async () => {
//     const content = contentInput.value.trim();
    
//     // Check for color command (e.g., /red, /blue, /purple)
//     if (content.startsWith('/')) {
//         const requestedColor = content.substring(1); // Get the text after the slash
//         triggerColorShift(requestedColor);
//         contentInput.value = ''; // Clear input
//         return; // Stop here so it doesn't send the command as a message
//     }

//     // ... (rest of your existing Supabase code)
// });
sendBtn.addEventListener('click', async () => {
    const content = contentInput.value.trim().toLowerCase();
    
    // List of rainbow triggers
    const prideTriggers = ['/rainbow', '/gay', '/pride', '/lgbtq', '/lesbian', '/queer'];
if (content.startsWith('/')) {
                const requestedColor = content.substring(1); // Get the text after the slash
                triggerColorShift(requestedColor);
                contentInput.value = ''; // Clear input
    if (prideTriggers.includes(content)) {
        // Apply rainbow class to the body
        document.body.classList.add('rainbow-mode');
        
        // Clear input
        contentInput.value = '';

        // Remove after 10 seconds
        setTimeout(() => {
            document.body.classList.remove('rainbow-mode');
        }, 10000);
        
        return; // Don't send the message to Supabase
    }

    
                return; // Stop here so it doesn't send the command as a message
            }
});