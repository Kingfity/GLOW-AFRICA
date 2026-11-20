import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { Download, Film, LogIn, Sparkles, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ALL_KENYA_COUNTIES } from '../utils/kenyaCounties';
import { validateStoryAnimationInput } from '../utils/specialNeedsGuide';

interface SavedStoryReel {
  id: string;
  title: string;
  caption: string;
  county: string;
  aspectRatio: '16:9' | '9:16';
  videoUrl: string;
}

export function StoryVideoAnimator({
  heading = 'Animate a Community Photograph Into a Living Story Reel',
  subtitle = 'Turn a real outreach or family photograph into a gentle 6-second documentary reel to share with sponsors, neighbours, or loved ones.',
}: {
  heading?: string;
  subtitle?: string;
}) {
  const { user, signInWithGoogle } = useAuth();

  const [imageDataUrl, setImageDataUrl] = useState('');
  const [photoTitle, setPhotoTitle] = useState('Ruiru Neighbourhood Fellowship Moment');
  const [prompt, setPrompt] = useState(
    'Warm afternoon golden daylight swaying courtyard acacia leaves while neighbours smile gently together'
  );
  const [county, setCounty] = useState('Kiambu');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [videoResultUrl, setVideoResultUrl] = useState('');
  const [savingReel, setSavingReel] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');
  const [savedReels, setSavedReels] = useState<SavedStoryReel[]>([]);

  useEffect(() => {
    if (!user) {
      setSavedReels([]);
      return;
    }
    const q = query(
      collection(db, 'storyAnimations'),
      where('ownerUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: SavedStoryReel[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            title: String(d.title || 'Community Story Reel'),
            caption: String(d.caption || ''),
            county: String(d.county || 'Kiambu'),
            aspectRatio: d.aspectRatio === '9:16' ? '9:16' : '16:9',
            videoUrl: String(d.videoUrl || ''),
          };
        });
        setSavedReels(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'storyAnimations');
      }
    );
    return () => unsubscribe();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setSaveNotice('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('Please select a photograph smaller than 4 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaveNotice('');

    const check = validateStoryAnimationInput({
      dataUrl: imageDataUrl,
      prompt,
      aspectRatio,
    });
    if (!check.valid) {
      setErrorMsg(check.error || 'Please choose a photo and enter a brief motion prompt.');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/animate-story-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl,
          prompt,
          aspectRatio,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || 'Unable to generate video animation right now.');
        return;
      }
      setVideoResultUrl(String(json.videoUrl || ''));
    } catch {
      setErrorMsg('Network timeout while generating video animation. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToFirebase = async () => {
    if (!user || !videoResultUrl) return;
    setSavingReel(true);
    setSaveNotice('');
    const persistedUrl =
      videoResultUrl.startsWith('data:') || videoResultUrl.length > 480
        ? 'downloaded-local-story-reel'
        : videoResultUrl;

    try {
      await addDoc(collection(db, 'storyAnimations'), {
        ownerUid: user.uid,
        title: (photoTitle.trim() || 'Community Story Reel').slice(0, 140),
        caption: prompt.trim().slice(0, 500),
        county,
        aspectRatio,
        videoUrl: persistedUrl,
        createdAt: serverTimestamp(),
      });
      setSaveNotice('Saved safely to your Firebase Circle keepsakes.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'storyAnimations');
    } finally {
      setSavingReel(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#D4AF37]/40 p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="space-y-2 border-b border-[#3B155F]/10 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#C2593F] inline-flex items-center gap-1.5">
          <Film className="w-4 h-4" />
          Living Documentary Story Studio
        </p>
        <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
          {heading}
        </h3>
        <p className="text-sm text-[#3E3349] leading-relaxed max-w-3xl">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleGenerateVideo} className="lg:col-span-6 space-y-4">
          <div>
            <label
              htmlFor="story-photo-upload"
              className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
            >
              1. Upload Real Outreach or Family Photo (PNG / JPG / WEBP, max 4 MB)
            </label>
            <label
              htmlFor="story-photo-upload"
              className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-[#3B155F]/25 rounded-lg bg-[#FAF7F2] hover:bg-[#F3EEF8]/50 cursor-pointer transition-colors text-center"
            >
              <Upload className="w-5 h-5 text-[#3B155F]" />
              <span className="text-xs font-medium text-[#1E0B2B]">
                {imageDataUrl ? 'Photograph selected — click to replace' : 'Choose photograph from device'}
              </span>
              <input
                id="story-photo-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            {imageDataUrl && (
              <img
                src={imageDataUrl}
                alt="Uploaded story preview"
                className="mt-3 max-h-44 rounded-lg object-cover border border-[#3B155F]/15"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="story-title"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1"
              >
                Reel Title
              </label>
              <input
                id="story-title"
                type="text"
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="story-county"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1"
              >
                County
              </label>
              <select
                id="story-county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
              >
                {ALL_KENYA_COUNTIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5">
              2. Video Aspect Ratio
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md border transition-colors ${
                  aspectRatio === '16:9'
                    ? 'bg-[#3B155F] text-white border-[#3B155F]'
                    : 'bg-[#FAF7F2] text-[#1E0B2B] border-[#3B155F]/20'
                }`}
              >
                16:9 Landscape (Web &amp; Presenters)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md border transition-colors ${
                  aspectRatio === '9:16'
                    ? 'bg-[#3B155F] text-white border-[#3B155F]'
                    : 'bg-[#FAF7F2] text-[#1E0B2B] border-[#3B155F]/20'
                }`}
              >
                9:16 Portrait (WhatsApp Status)
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="story-prompt"
              className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1"
            >
              3. Gentle Motion Prompt
            </label>
            <textarea
              id="story-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
            />
          </div>

          {errorMsg && (
            <p role="alert" className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-md">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#3B155F] text-[#FAF7F2] hover:bg-[#2C1042] disabled:opacity-60 rounded-md transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#F5D67B]" />
            {generating ? 'Animating Photograph (up to 60s)...' : 'Animate Story Photograph'}
          </button>
        </form>

        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-xl bg-[#160822] text-[#FAF7F2] min-h-[260px] flex flex-col justify-center items-center text-center space-y-4">
            {videoResultUrl ? (
              <div className="w-full space-y-3 text-left">
                <video
                  src={videoResultUrl}
                  controls
                  playsInline
                  className="w-full max-h-[340px] rounded-lg bg-black"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={videoResultUrl}
                    download="circle-of-hope-story.mp4"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#D4AF37] text-[#160822] rounded-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download MP4 Reel
                  </a>
                  {user ? (
                    <button
                      type="button"
                      onClick={handleSaveToFirebase}
                      disabled={savingReel}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#256358] text-white rounded-md disabled:opacity-60"
                    >
                      {savingReel ? 'Saving...' : 'Save Keepsake to Circle Account'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void signInWithGoogle('member', county)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-white/30 text-[#FAF7F2] rounded-md hover:bg-white/10"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In With Google to Save Reel
                    </button>
                  )}
                </div>
                {saveNotice && (
                  <p className="text-xs text-[#84B5A9] font-medium">{saveNotice}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-w-sm">
                <Film className="w-8 h-8 text-[#F5D67B] mx-auto" />
                <p className="font-serif text-lg font-medium">
                  Animated Story Preview Appears Here
                </p>
                <p className="text-xs text-[#FAF7F2]/75 leading-relaxed">
                  Powered by Gemini Omni video synthesis (`gemini-omni-1.2-flash`). Requires a
                  billing-enabled `GEMINI_API_KEY` on the server.
                </p>
              </div>
            )}
          </div>

          {user && savedReels.length > 0 && (
            <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#3B155F]/15 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                Your Saved Story Keepsakes ({savedReels.length})
              </p>
              <ul className="space-y-1.5 text-xs text-[#3E3349]">
                {savedReels.slice(0, 4).map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[#1E0B2B] truncate">
                      {item.title} · {item.county} ({item.aspectRatio})
                    </span>
                    {item.videoUrl.startsWith('/uploads/') && (
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3B155F] font-semibold hover:underline shrink-0"
                      >
                        Open
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
