// Extracted verbatim from Bondage-College-Mirror-bondageclub/Scripts/Server.js (GameVersion R132).
// Network transport is replaced by a recorder in tests; no live account is accessed.
var ServerAccountUpdate = new class AccountUpdater {

	constructor() {
		/**
		 * @private
		 * @type {Map<keyof ServerAccountUpdateRequest, any>}
		 */
		this.Queue = new Map;
		/**
		 * @private
		 * @type {null | ReturnType<typeof setTimeout>}
		 */
		this.Timeout = null;
		/**
		 * @private
		 * @type {number}
		 */
		this.Start = 0;
	}

	/** Clears queue and sync with server  */
	SyncToServer() {
		if (this.Timeout) clearTimeout(this.Timeout);
		this.Timeout = null;

		if (this.Queue.size == 0) return;

		const Queue = this.Queue;
		this.Queue = new Map;
		const Data = {};
		Queue.forEach((value, key) => Data[key] = value);

		ServerSend("AccountUpdate", Data);
	}

	/**
	 * Queues a data to be synced at a later time
	 * @param {ServerAccountUpdateRequest} Data
	 * @param {boolean} [Force] - force immediate sync to server
	 */
	QueueData(Data, Force=false) {
		// Not logged in. Different from `ServerIsLoggedIn()` because we want messages to happen still
		if (Player.CharacterID === "") return;

		for (const [key, value] of CommonEntries(Data)) {
			this.Queue.set(key, value);
		}

		if (Force) {
			this.SyncToServer();
			return;
		}

		if (this.Timeout) {
			if (Date.now() - this.Start <= 8000) {
				clearTimeout(this.Timeout);
				this.Timeout = null;
			}
		} else this.Start = Date.now();

		if (!this.Timeout) this.Timeout = setTimeout(this.SyncToServer.bind(this), 2000);
	}
};

function ServerPlayerExtensionSettingsSync(dataKeyName, _force = false) {
	if (Player.ExtensionSettings[dataKeyName] === undefined) {
		throw new Error(`Invalid key '${dataKeyName}' attempting to save 'undefined'`);
	}
	const obj = { [`ExtensionSettings.${dataKeyName}`]: Player.ExtensionSettings[dataKeyName] };

	ServerSend("AccountUpdate", obj);
}

var ServerSendRateLimit = 14;
/** Ratelimit: Length of the rate-limit window, in msec */
var ServerSendRateLimitInterval = 1200;

/**
 * Queued messages waiting to be sent
 *
 * @type {SendRateLimitQueueItem[]}
 */
const ServerSendRateLimitQueue = [];

/** @type {number[]} */
let ServerSendRateLimitTimes = [];

/**
 * Sends a message with the given data to the server via socket.emit
 * @type {<Ev extends import("@socket.io/component-emitter").EventNames<ClientToServerEvents>>(
 *     ev: Ev, ...args: import("@socket.io/component-emitter").EventParams<ClientToServerEvents, Ev>
 * ) => void}
 */
function ServerSend(Message, ...args) {
	// Not logged in. Different from `ServerIsLoggedIn()` because we want messages to happen still
	if (Player.CharacterID === "" && !["AccountCreate", "AccountLogin", "PasswordReset", "PasswordResetProcess"].includes(Message)) return; // We're not logged in
	const queueItem = /** @type {SendRateLimitQueueItem} */({ Message, args });
	ServerSendRateLimitQueue.push(queueItem);

	// Pump the queue manually to fight back against background tab throttling
	ServerSendQueueProcess();
}

/**
 * Process the outgoing server messages queue
 */
function ServerSendQueueProcess() {
	ServerSendRateLimitTimes = ServerSendRateLimitTimes.filter(
		(t) => Date.now() - t < ServerSendRateLimitInterval
	);

	while (
		ServerSendRateLimitTimes.length < ServerSendRateLimit &&
		ServerSendRateLimitQueue.length > 0
	) {
		const item = ServerSendRateLimitQueue.shift();
		if (item) {
			if (item.Message === "ChatRoomChat") {
				const [data] = item.args;
				if (["Chat", "Emote", "Whisper"].includes(data?.Type) && (CommonIsArray(data.Dictionary) || data.Dictionary === undefined)) {
					data.Dictionary = data?.Dictionary ?? [];
					data.Dictionary.push({ Tag: "MsgId", MsgId: CommonGenerateUniqueID() });
				}
			}
			ServerSocket.emit(item.Message, ...item.args);
			ServerSendRateLimitTimes.push(Date.now());
		}
	}
}

