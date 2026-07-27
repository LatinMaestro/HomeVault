# Phase 7B: Native Camera And Document Capture

Status: staged policy contract; native capture modules and live capture remain disabled.

## Approved Direction

- Capture starts only after a verified user chooses camera, document scanner or file import.
- Camera permission is requested in context, never at launch. File import does not request broad photo-library access.
- OWNER and ADULT roles may capture for the explicitly selected property. CHILD and GUEST remain read-only.
- Captures stay in protected application sandbox storage until explicit review and upload.
- HomeVault does not save captures to the device photo library unless the user separately exports them.
- Location, contacts, microphone and unrelated media permissions remain prohibited.

## Review And Privacy Processing

- Every capture shows a review screen before upload, with approve, retake and cancel actions.
- Retake and cancel delete the prior temporary asset.
- Orientation is normalized and unnecessary EXIF/location/device metadata is removed before approval.
- The existing PDF/JPEG/PNG signature, media-type and 4 MB checks apply again on the server.
- OCR, AI classification and automatic record creation remain disabled; later phases may offer reviewable drafts only.
- Temporary drafts are bound to immutable user, property and app installation and expire automatically.

## Private Upload Boundary

- Upload requires a current verified session, exact property membership and OWNER or ADULT role.
- Record/property scope is revalidated on the server immediately before storage.
- Captures use the existing private Vercel Blob path and never expose object URLs or storage keys.
- Upload operations carry an idempotency key and compensate by deleting any partial Blob after failure.
- The current one-attachment-per-Document limit remains until the reviewed gallery phase.
- Backgrounding locks the interface. Protected temporary capture survives only for its bounded draft lifetime so native camera transitions do not destroy in-progress work.
- Account switch, sign-out, deletion, expiry, cancel and retake scrub temporary capture state.

## Verification

Production enablement requires approved native modules, iOS purpose strings, Android manifest review, permission denial/recovery tests, camera and scanner review/retake tests, rotation and metadata-sanitization tests, low-memory/background interruption tests, private upload and compensation tests, account-switch cleanup, accessibility, physical-device testing, disclosure updates and exact-head standard/native CI.
