# Nexus Video Player

> **A simple video player for final project of Data Structure and Algorithm course, the implementation of Doubly Linked List and Queue.**

This application demonstrates two main data structures without relying on an external *database* (using `localStorage` for *client-side* data persistence):

### 1. Doubly Linked List (Playback History / Player)
Used to manage currently playing videos and their navigation history.
* **Mechanism:** Each video is represented as a `Node` that has two *pointers* (`next` and `prev`).
* **Time Complexity:** Moving to the next (`playNext`) or previous (`playPrev`) video is very efficient with a complexity of $\mathcal{O}(1)$.

### 2. Queue (Playlist Queue)
Used to manage a list of videos to be played next using the **FIFO (First In, First Out)** principle.
* **Mechanism:** New video URLs from the user are added to the back of the queue (`enqueue`). When the current video runs out or the user plays a new video, the leading element is dequeued from the queue and played in the *player*.
* **Time Complexity:** The operations of adding and removing queues have constant time complexity $\mathcal{O}(1)$.

---

## 🛠️ Technology Used
* **Frontend:** HTML5, Vanilla JavaScript (ES6+ Class)
* **Styling:** Tailwind CSS (via CDN)
* **State Management:** Web Storage API (`localStorage`)
* **Deployment:** Vercel

---

## 👥 Team Crowbar Co.

This project was developed collaboratively with the following division of work roles:

| Nama | Peran / Tugas |
| :--- | :--- |
| **Dhiauddin Arfa** | Core Algorithm |
| **Ulwan Luthfi** | [Isi Role Teman 2] |
| **Jhony Agus** | CEO of Crowbar Co. |
| **Farras Mufid** | [Isi Role Teman 4] |
| **Ahmad Afifi** | [Isi Role Teman 5] |

---