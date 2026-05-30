// Main logic (class node, doubly linked list, and queue)

// Node class r doubly linked list
class videoNode {
    // Constructor to initialize the node with title and url
    constructor(title, url) {
        // Store the title
        this.title = title;
        // Store the url
        this.url = url;
        // Initialize the next video to null
        this.next = null;
        // Initialize the previous video to null
        this.prev = null;
    }
}

// Doubly linked list class to manage the list of videos
class videoPlayer {
    // Initialize the start, end, and current video to null
    constructor() {
        this.start = null;
        this.end = null;
        // Current video that is being played
        this.current = null;
    }

    // Method to add a new video to the end of the list
    addVideo(title, url) {
        const newNode = new videoNode(title, url);
        // If the list is empty, set the new video as the start and end
        if (!this.start) {
            this.start = newNode;
            this.end = newNode;
            this.current = newNode;
        } else {
            // Set the new video as the next of the current end
            this.end.next = newNode;
            // Set the previous of the new video to the current end
            newNode.prev = this.end;
            // Set the current end to the new video
            this.end = newNode;
        }
    }

    // Methos to play the next video in the playlist
    playNext () {
        // Check if there is a video playing and if there is a next video
        if (this.current && this.current.next) {
            this.current = this.current.next;
            // Return the current video pointer after moving to the next video
            return this.current;
        }
        // If there is no next video, return null
        return null;
    }

    // Method to play the previous video in the playlist
    playPrevious() {
        if (this.current && this.current.prev) {
            this.current = this.current.prev;
            return this.current;
        }
    }
}