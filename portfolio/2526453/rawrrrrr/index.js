// run `node index.js` in the terminal

console.log(`Hello Node.js v${process.versions.node}!`);
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HKSC - Teacher Availability Tracker</title>
    <style>
        /* CSS Styling */
        :root {
            --primary: #003366; /* HKSC School Color (Simulated) */
            --light-bg: #f4f7f6;
            --white: #ffffff;
            --green: #2ecc71;
            --red: #e74c3c;
            --yellow: #f1c40f;
            --grey: #95a5a6;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--light-bg);
            margin: 0;
            padding: 0;
        }

        /* Header Section */
        header {
            background-color: var(--primary);
            color: var(--white);
            padding: 20px;
            text-align: center;
        }

        header h1 { margin: 0; font-size: 1.5rem; }
        header p { margin: 5px 0 0; opacity: 0.8; font-size: 0.9rem; }

        /* Search Bar */
        .search-container {
            max-width: 800px;
            margin: 20px auto;
            padding: 0 15px;
            display: flex;
            gap: 10px;
        }

        input[type="text"] {
            width: 100%;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        /* Grid Layout */
        .container {
            max-width: 1000px;
            margin: 0 auto 50px;
            padding: 0 15px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
        }

        /* Teacher Card */
        .card {
            background: var(--white);
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            transition: transform 0.2s;
            border-left: 5px solid var(--grey); /* Default border color */
        }

        .card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 15px rgba(0,0,0,0.1);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .teacher-name {
            font-size: 1.2rem;
            font-weight: bold;
            color: #333;
        }

        .department {
            font-size: 0.85rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Status Badges */
        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            color: white;
            margin-top: 10px;
        }

        .location {
            margin-top: 10px;
            font-size: 0.9rem;
            color: #444;
            display: flex;
            align-items: center;
        }

        .location span { font-weight: bold; margin-left: 5px; }

        /* Status Colors */
        .card.available { border-left-color: var(--green); }
        .card.available .status-badge { background-color: var(--green); }
        
        .card.busy { border-left-color: var(--yellow); }
        .card.busy .status-badge { background-color: var(--yellow); color: #333; }
        
        .card.absent { border-left-color: var(--red); }
        .card.absent .status-badge { background-color: var(--red); }

        /* Last Updated */
        .timestamp {
            font-size: 0.75rem;
            color: #aaa;
            margin-top: 15px;
            text-align: right;
        }

    </style>
</head>
<body>

    <header>
        <h1>HKSC Teacher Locator</h1>
        <p>Check teacher availability and staff room status</p>
    </header>

    <div class="search-container">
        <input type="text" id="searchInput" placeholder="Search by teacher name or subject (e.g., 'Mr. Chan' or 'Math')...">
    </div>

    <div class="container" id="teacherGrid">
        </div>

    <script>
        // --- DATA SIMULATION ---
        // In a real app, this data would come from a database API
        const teachers = [
            { id: 1, name: "Mr. David Wong", subject: "Mathematics", status: "available", location: "Staff Room A", lastUpdated: "10:05 AM" },
            { id: 2, name: "Ms. Sarah Lee", subject: "English", status: "busy", location: "Room 304 (Teaching)", lastUpdated: "09:50 AM" },
            { id: 3, name: "Mr. James Chen", subject: "Physics", status: "absent", location: "Sick Leave", lastUpdated: "08:00 AM" },
            { id: 4, name: "Mrs. Emily Ho", subject: "History", status: "available", location: "Staff Room B", lastUpdated: "10:15 AM" },
            { id: 5, name: "Mr. K.L. Cheung", subject: "PE", status: "busy", location: "Gymnasium", lastUpdated: "10:00 AM" },
            { id: 6, name: "Ms. Linda Yeung", subject: "Chemistry", status: "absent", location: "Public Holiday", lastUpdated: "08:00 AM" },
            { id: 7, name: "Mr. Robert Smith", subject: "Music", status: "busy", location: "Meeting Room 1", lastUpdated: "09:30 AM" },
        ];

        const grid = document.getElementById('teacherGrid');
        const searchInput = document.getElementById('searchInput');

        // --- RENDER FUNCTION ---
        function renderTeachers(data) {
            grid.innerHTML = ''; // Clear current grid

            if (data.length === 0) {
                grid.innerHTML = '<p style="text-align:center; width:100%; color:#666;">No teachers found matching that name.</p>';
                return;
            }

            data.forEach(teacher => {
                // Determine display text based on status code
                let statusText = "";
                if (teacher.status === 'available') statusText = "Available";
                else if (teacher.status === 'busy') statusText = "Busy / In Class";
                else statusText = "Absent / Off-Campus";

                // Create Card HTML
                const card = document.createElement('div');
                card.className = `card ${teacher.status}`;
                card.innerHTML = `
                    <div class="card-header">
                        <div class="department">${teacher.subject}</div>
                    </div>
                    <div class="teacher-name">${teacher.name}</div>
                    <div class="status-badge">${statusText}</div>
                    <div class="location">
                        📍 <span>${teacher.location}</span>
                    </div>
                    <div class="timestamp">Updated: ${teacher.lastUpdated}</div>
                `;
                grid.appendChild(card);
            });
        }

        // --- SEARCH FUNCTION ---
        searchInput.addEventListener('keyup', (e) => {
            const searchString = e.target.value.toLowerCase();
            const filteredTeachers = teachers.filter(teacher => {
                return (
                    teacher.name.toLowerCase().includes(searchString) ||
                    teacher.subject.toLowerCase().includes(searchString)
                );
            });
            renderTeachers(filteredTeachers);
        });

        // Initial Render
        renderTeachers(teachers);

    </script>
</body>
</html>