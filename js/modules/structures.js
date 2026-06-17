// Data structure models for Video Player navigation and queuing systems

/**
 * Node structure for the Doubly Linked List (Main Playlist Navigation)
 */
export class VideoNode {
  constructor(title, url) {
    this.title = title;
    this.url = url;
    this.next = null;
    this.prev = null;
  }
}

/**
 * Node structure for the FIFO Queue (Up Next Queue System)
 */
export class QueueNode {
  constructor(title, url) {
    this.title = title;
    this.url = url;
    this.next = null;
  }
}

/**
 * Doubly Linked List implementation to handle track historical navigation
 */
export class VideoPlayer {
  constructor() {
    this.start = null;
    this.end = null;
    this.current = null;
  }

  addVideo(title, url) {
    const newNode = new VideoNode(title, url);
    if (!this.start) {
      this.start = newNode;
      this.end = newNode;
      this.current = newNode;
    } else {
      this.end.next = newNode;
      newNode.prev = this.end;
      this.end = newNode;
    }
  }

  playNext() {
    if (this.current && this.current.next) {
      this.current = this.current.next;
      return this.current;
    }
    return null;
  }

  playPrevious() {
    if (this.current && this.current.prev) {
      this.current = this.current.prev;
      return this.current;
    }
    return null;
  }

  getCurrentVideo() {
    return this.current;
  }

  /**
   * Removes a video node from the playlist by its traversal index
   * and heals the surrounding doubly-linked pointers.
   * @param {number} index - The target position to delete
   * @returns {VideoNode|null} The deleted node element
   */
  removeVideoByIndex(index) {
    if (!this.start) return null;

    let current = this.start;
    let counter = 0;

    while (current && counter < index) {
      current = current.next;
      counter++;
    }

    if (!current) return null; // Index out of bounds

    // If the active playing video is being deleted, shift pointer forward or backward
    if (current === this.current) {
      this.current = current.next || current.prev;
    }

    // Heal the broken chain pointers
    if (current.prev) current.prev.next = current.next;
    if (current.next) current.next.prev = current.prev;

    // Adjust list boundaries
    if (current === this.start) this.start = current.next;
    if (current === this.end) this.end = current.prev;

    return current;
  }

  /**
   * Purges all pointers inside the DLL to allow safe sequence reconstruction
   */
  clear() {
    this.start = null;
    this.end = null;
    this.current = null;
  }
}

/**
 * FIFO Queue implementation to handle user-defined "Up Next" media queue
 */
export class VideoQueue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.size = 0;
  }

  enqueue(title, url) {
    const newNode = new QueueNode(title, url);
    // FIXED: Corrected logical inversion for empty queue checking
    if (this.isEmpty()) {
      this.front = newNode;
      this.rear = newNode;
    } else {
      this.rear.next = newNode;
      this.rear = newNode;
    }
    this.size++;
  }

  dequeue() {
    // FIXED: Corrected logic to prevent early return on valid state
    if (this.isEmpty()) {
      return null;
    }
    const dequeuedNode = this.front;
    this.front = this.front.next;

    if (!this.front) {
      this.rear = null;
    }
    this.size--;
    return dequeuedNode;
  }

  isEmpty() {
    return this.size === 0;
  }

  getQueue() {
    const result = [];
    let current = this.front;
    while (current) {
      result.push({ title: current.title, url: current.url });
      current = current.next;
    }
    return result;
  }
}
