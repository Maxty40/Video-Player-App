import { VideoPlayer, VideoQueue } from './modules/structures.js';
import { StorageManager } from './modules/storage.js';

document.addEventListener('DOMContentLoaded', () => {
  let player = new VideoPlayer();
  let queue = new VideoQueue();

  const isStorageFresh = !localStorage.getItem(
    StorageManager.KEYS.PLAYER_PLAYLIST,
  );

  if (isStorageFresh) {
    const DEFAULT_PLAYLIST_SEEDS = [
      {
        title: 'What are data structures and algorithms?',
        url: 'https://youtu.be/xX5iOYCJmBI?si=JVGwP4NqU1j73aLE',
      },
      {
        title: 'Learn Stack data structures in 10 minutes',
        url: 'https://youtu.be/KInG04mAjO0?si=ATLBzPdnYk9w4tsH',
      },
      {
        title: 'Learn Queue data structures in 10 minutes',
        url: 'https://youtu.be/nqXaPZi99JI?si=TKbp7XIPnli4znLI',
      },
      {
        title: 'Learn Priority Queue data structures in 5 minutes',
        url: 'https://youtu.be/7z_HXFZqXqc?si=2kv4lgJHNNHVLVcg',
      },
      {
        title: 'Learn Linked Lists in 13 minutes',
        url: 'https://youtu.be/N6dOwBde7-M?si=1UD4XTXO7kVBI4CI',
      },
    ];
    DEFAULT_PLAYLIST_SEEDS.forEach((video) =>
      player.addVideo(video.title, video.url),
    );
    StorageManager.savePlayerState(player);
  } else {
    player = StorageManager.hydratePlayerState(player);
  }
  queue = StorageManager.hydrateQueueState(queue);

  const dom = {
    videoElement: document.getElementById('main-video-player'),
    videoOverlay: document.getElementById('video-placeholder-overlay'),
    activeTitle: document.getElementById('active-video-title'),
    btnPrev: document.getElementById('btn-prev-track'),
    btnNext: document.getElementById('btn-next-track'),
    btnDequeuePlay: document.getElementById('btn-dequeue-play'),
    form: document.getElementById('media-registry-form'),
    inputTitle: document.getElementById('input-video-title'),
    inputUrl: document.getElementById('input-video-url'),
    btnQueryAddPlaylist: document.getElementById('btn-add-playlist'),
    btnQueryEnqueue: document.getElementById('btn-enqueue-queue'),
    queueContainer: document.getElementById('queue-nodes-container'),
    queueEmptyState: document.getElementById('queue-empty-state'),
    queueBadge: document.getElementById('queue-badge-count'),
    // NEW DOM ACCESS
    playlistContainer: document.getElementById('playlist-nodes-container'),
  };

  let draggedItemIndex = null; // Track structural index during drag lifecycle

  function convertToEmbedUrl(url) {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&enablejsapi=1`
      : null;
  }

  // =========================================================================
  // RENDERING ENGINE
  // =========================================================================

  function renderActiveVideoUI() {
    const currentVideo = player.getCurrentVideo();

    if (!currentVideo) {
      dom.videoOverlay.classList.remove('hidden');
      dom.activeTitle.textContent = '---';
      dom.videoElement.src = '';
      dom.btnPrev.disabled = true;
      dom.btnNext.disabled = true;
      return;
    }

    dom.videoOverlay.classList.add('hidden');
    dom.activeTitle.textContent = currentVideo.title;

    const embedUrl = convertToEmbedUrl(currentVideo.url);
    if (embedUrl) {
      const currentSrc = dom.videoElement.src;
      if (currentSrc !== embedUrl) dom.videoElement.src = embedUrl;
    } else {
      dom.activeTitle.textContent = `${currentVideo.title} [Invalid URL]`;
      dom.videoElement.src = '';
    }

    dom.btnPrev.disabled = !currentVideo.prev;
    dom.btnNext.disabled = !currentVideo.next;

    // Side-Effect trigger: Highlighting matching active track card in the list
    updatePlaylistActiveHighlight();
  }

  /**
   * Renders the DLL layout as a vertical list supporting native Drag & Drop mutations
   */
  function renderPlaylistUI() {
    dom.playlistContainer.innerHTML = '';

    let current = player.start;
    let index = 0;

    if (!current) {
      dom.playlistContainer.innerHTML = `<p class="text-xs text-slate-600 text-center py-4">No tracks available in playlist.</p>`;
      return;
    }

    while (current) {
      const itemElement = document.createElement('div');
      itemElement.className =
        'playlist-item-card flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/60 transition-all cursor-grab active:cursor-grabbing';
      itemElement.setAttribute('draggable', 'true');
      itemElement.setAttribute('data-index', index);

      const isActive = current === player.getCurrentVideo();

      itemElement.innerHTML = `
                <div class="flex items-center gap-2.5 truncate pointer-events-none">
                    <span class="drag-handle text-slate-400 hover:text-slate-500 text-xs">☰</span>
                    <div class="truncate">
                        <p class="text-xs font-semibold ${isActive ? 'text-blue-500' : 'text-slate-700'} truncate">${escapeHTML(current.title)}</p>
                    </div>
                </div>
                <button type="button" data-action="delete" data-index="${index}" class="text-[10px] text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded transition-colors cursor-pointer ml-2">
                    Delete
                </button>
            `;

      // Bind Drag & Drop Events directly to the individual element card
      itemElement.addEventListener('dragstart', handleDragStart);
      itemElement.addEventListener('dragover', handleDragOver);
      itemElement.addEventListener('drop', handleDrop);

      dom.playlistContainer.appendChild(itemElement);

      current = current.next;
      index++;
    }
  }

  function updatePlaylistActiveHighlight() {
    const cards = dom.playlistContainer.querySelectorAll('.playlist-item-card');
    const currentVideo = player.getCurrentVideo();

    cards.forEach((card, idx) => {
      const titleText = card.querySelector('p');
      if (currentVideo && idx === getPlaylistNodeIndex(currentVideo)) {
        card.classList.add('border-blue-500/40', 'bg-blue-50');
        titleText.classList.add('text-blue-500');
      } else {
        card.classList.remove('border-blue-500/40', 'bg-blue-50');
        titleText.classList.remove('text-blue-500');
      }
    });
  }

  function getPlaylistNodeIndex(targetNode) {
    let current = player.start;
    let idx = 0;
    while (current) {
      if (current === targetNode) return idx;
      current = current.next;
      idx++;
    }
    return -1;
  }

  function renderQueueUI() {
    const queueItems = queue.getQueue();
    dom.queueBadge.textContent = `${queueItems.length} Item${queueItems.length !== 1 ? 's' : ''}`;
    const dynamicNodes =
      dom.queueContainer.querySelectorAll('.queue-item-node');
    dynamicNodes.forEach((node) => node.remove());

    if (queue.isEmpty()) {
      dom.queueEmptyState.classList.remove('hidden');
      dom.btnDequeuePlay.disabled = true;
      return;
    }

    dom.queueEmptyState.classList.add('hidden');
    dom.btnDequeuePlay.disabled = false;

    queueItems.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.className =
        'queue-item-node flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-blue-500/40 transition-all group';
      itemElement.innerHTML = `
                <div class="flex items-center gap-3 truncate">
                    <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 group-hover:bg-blue-600/20 group-hover:text-blue-500 transition-colors">
                        ${index + 1}
                    </span>
                    <div class="truncate">
                        <p class="text-xs font-bold text-slate-800 truncate">${escapeHTML(item.title)}</p>
                        <p class="text-[10px] text-slate-400 truncate mt-0.5">${escapeHTML(item.url)}</p>
                    </div>
                </div>
            `;
      dom.queueContainer.appendChild(itemElement);
    });
  }

  function escapeHTML(str) {
    return str.replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;',
        })[tag] || tag,
    );
  }

  // =========================================================================
  // DRAG AND DROP HANDLERS ENGINE (Array Reconstruction Strategy)
  // =========================================================================

  function handleDragStart(e) {
    draggedItemIndex = parseInt(this.getAttribute('data-index'), 10);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
    e.preventDefault(); // Crucial to allow dropping targets
  }

  function handleDrop(e) {
    e.preventDefault();
    const targetIndex = parseInt(this.getAttribute('data-index'), 10);

    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    // 1. Flatten current DLL to an array snapshot
    const listArray = [];
    let current = player.start;
    while (current) {
      listArray.push({ title: current.title, url: current.url });
      current = current.next;
    }

    // 2. Track the active playing video identifier (URL) before purging structures
    const currentlyPlayingUrl = player.getCurrentVideo()
      ? player.getCurrentVideo().url
      : null;

    // 3. Mutate the array sequence matching the drag/drop delta positions
    const [reorderedItem] = listArray.splice(draggedItemIndex, 1);
    listArray.splice(targetIndex, 0, reorderedItem);

    // 4. Wipe core memory list and rebuild structural pointers cleanly
    player.clear();
    listArray.forEach((item) => player.addVideo(item.title, item.url));

    // 5. Restore the active playing node binding via reference check loop
    if (currentlyPlayingUrl) {
      let curr = player.start;
      while (curr) {
        if (curr.url === currentlyPlayingUrl) {
          player.current = curr;
          break;
        }
        curr = curr.next;
      }
    }

    // 6. Persist changes & synchronize user interface
    StorageManager.savePlayerState(player);
    renderPlaylistUI();
    renderActiveVideoUI();

    draggedItemIndex = null;
  }

  // =========================================================================
  // CONTROLLER CONTROLS & EVENT DELEGATION
  // =========================================================================

  function handleAddVideoToPlaylist() {
    const title = dom.inputTitle.value.trim();
    const url = dom.inputUrl.value.trim();
    if (!title || !url || !convertToEmbedUrl(url)) return;

    player.addVideo(title, url);
    StorageManager.savePlayerState(player);

    renderPlaylistUI();
    renderActiveVideoUI();
    dom.form.reset();
  }

  function handleEnqueueVideo() {
    const title = dom.inputTitle.value.trim();
    const url = dom.inputUrl.value.trim();
    if (!title || !url || !convertToEmbedUrl(url)) return;

    queue.enqueue(title, url);
    StorageManager.saveQueueState(queue);
    renderQueueUI();
    dom.form.reset();
  }

  function handleProcessNextQueueNode() {
    const dequeuedNode = queue.dequeue();
    if (!dequeuedNode) return;

    player.addVideo(dequeuedNode.title, dequeuedNode.url);
    player.current = player.end;

    StorageManager.saveQueueState(queue);
    StorageManager.savePlayerState(player);

    renderQueueUI();
    renderPlaylistUI();
    renderActiveVideoUI();
  }

  // Event Delegation: Clean execution tracking for playlist deletion handling
  dom.playlistContainer.addEventListener('click', (e) => {
    if (e.target && e.target.getAttribute('data-action') === 'delete') {
      const indexToDelete = parseInt(e.target.getAttribute('data-index'), 10);

      player.removeVideoByIndex(indexToDelete);
      StorageManager.savePlayerState(player);

      renderPlaylistUI();
      renderActiveVideoUI();
    }
  });

  // Navigation Triggers
  dom.btnQueryAddPlaylist.addEventListener('click', handleAddVideoToPlaylist);
  dom.btnQueryEnqueue.addEventListener('click', handleEnqueueVideo);
  dom.btnDequeuePlay.addEventListener('click', handleProcessNextQueueNode);

  dom.btnPrev.addEventListener('click', () => {
    if (player.playPrevious()) {
      StorageManager.savePlayerState(player);
      renderActiveVideoUI();
    }
  });

  dom.btnNext.addEventListener('click', () => {
    if (player.playNext()) {
      StorageManager.savePlayerState(player);
      renderActiveVideoUI();
    }
  });

  // =========================================================================
  // BOOTSTRAP INITIAL RUN
  // =========================================================================
  renderPlaylistUI();
  renderActiveVideoUI();
  renderQueueUI();
});
