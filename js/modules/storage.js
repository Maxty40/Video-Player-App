/**
 * StorageManager - Handles serialization, deserialization, and hydration
 * for custom Doubly Linked List and FIFO Queue structures.
 */
export class StorageManager {
  static KEYS = {
    PLAYER_PLAYLIST: 'vpa_playlist_data',
    PLAYER_CURRENT_INDEX: 'vpa_playlist_current_idx',
    QUEUE_DATA: 'vpa_queue_data',
  };

  /**
   * Serializes and saves the VideoPlayer (DLL) state to LocalStorage
   * @param {Object} videoPlayer - Instance of VideoPlayer class
   */
  static savePlayerState(videoPlayer) {
    const serializedPlaylist = [];
    let current = videoPlayer.start;
    let currentIndex = -1;
    let counter = 0;

    // Traverse DLL to flatten data and locate the active node's index
    while (current) {
      serializedPlaylist.push({ title: current.title, url: current.url });
      if (current === videoPlayer.getCurrentVideo()) {
        currentIndex = counter;
      }
      current = current.next;
      counter++;
    }

    try {
      localStorage.setItem(
        this.KEYS.PLAYER_PLAYLIST,
        JSON.stringify(serializedPlaylist),
      );
      localStorage.setItem(
        this.KEYS.PLAYER_CURRENT_INDEX,
        currentIndex.toString(),
      );
    } catch (error) {
      console.error('Failed to serialize and save VideoPlayer state:', error);
    }
  }

  /**
   * Loads and hydrates raw data back into a valid VideoPlayer (DLL) instance
   * @param {VideoPlayer} videoPlayerInstance - An empty or fresh instance to hydrate
   * @returns {VideoPlayer} Hydrated instance with structural integrity intact
   */
  static hydratePlayerState(videoPlayerInstance) {
    const rawPlaylist = localStorage.getItem(this.KEYS.PLAYER_PLAYLIST);
    const rawIndex = localStorage.getItem(this.KEYS.PLAYER_CURRENT_INDEX);

    if (!rawPlaylist) return videoPlayerInstance;

    try {
      const playlistData = JSON.parse(rawPlaylist);
      const targetIndex = rawIndex ? parseInt(rawIndex, 10) : 0;

      // Reconstruct nodes and link pointers via addVideo blueprint
      playlistData.forEach((item) => {
        videoPlayerInstance.addVideo(item.title, item.url);
      });

      // Hydrate the 'current' pointer state based on the saved index
      let current = videoPlayerInstance.start;
      let counter = 0;
      while (current && counter < targetIndex) {
        current = current.next;
        counter++;
      }

      if (current) {
        videoPlayerInstance.current = current;
      }
    } catch (error) {
      console.error(
        'Failed to parse and hydrate VideoPlayer state, resetting storage:',
        error,
      );
      this.clearAll();
    }

    return videoPlayerInstance;
  }

  /**
   * Serializes and saves the VideoQueue state to LocalStorage
   * @param {VideoQueue} videoQueue - Instance of VideoQueue class
   */
  static saveQueueState(videoQueue) {
    // Leverages the built-in getQueue representation
    const queueData = videoQueue.getQueue();
    try {
      localStorage.setItem(this.KEYS.QUEUE_DATA, JSON.stringify(queueData));
    } catch (error) {
      console.error('Failed to serialize and save VideoQueue state:', error);
    }
  }

  /**
   * Loads and hydrates raw data back into a valid VideoQueue instance
   * @param {VideoQueue} videoQueueInstance - An empty instance to hydrate
   * @returns {VideoQueue} Hydrated queue instance
   */
  static hydrateQueueState(videoQueueInstance) {
    const rawQueue = localStorage.getItem(this.KEYS.QUEUE_DATA);
    if (!rawQueue) return videoQueueInstance;

    try {
      const queueData = JSON.parse(rawQueue);
      queueData.forEach((item) => {
        videoQueueInstance.enqueue(item.title, item.url);
      });
    } catch (error) {
      console.error('Failed to parse and hydrate VideoQueue state:', error);
    }

    return videoQueueInstance;
  }

  /**
   * Purges all application specific states from local storage
   */
  static clearAll() {
    Object.values(this.KEYS).forEach((key) => localStorage.removeItem(key));
  }
}
