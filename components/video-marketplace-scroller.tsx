"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowRight,
  Heart,
  Loader2,
  LogOut,
  Play,
  Search,
  ShoppingBag,
  UploadCloud,
  UserRound,
  UsersRound,
} from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatKzt } from "@/lib/format";
import {
  getSupabaseBrowserClient,
  supabaseConfig,
} from "@/lib/supabase-client";
import type { MarketplaceVideo } from "@/types/social";

type FeedView = "feed" | "marketplace" | "upload";

type MarketplaceOffer = {
  id: string;
  marketplace: string;
  title: string;
  imageUrl: string;
  priceText?: string;
  priceKzt?: number;
  sourceUrl: string;
  originCountry?: string;
};

type MarketplaceSearchPayload = {
  offers?: MarketplaceOffer[];
  error?: string;
};

const videoBucket = "ad-videos";
const maxUploadBytes = 50 * 1024 * 1024;
const inputClasses =
  "min-h-11 rounded-lg border border-white/70 bg-white/60 px-3 text-content outline-none transition focus:border-accent/40 focus:bg-white";
const fileInputClasses =
  "min-h-11 rounded-lg border border-white/70 bg-white/60 px-3 py-2 text-content file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-content";

const defaultUploadForm = {
  channelName: "",
  title: "",
  productQuery: "",
};

const feedTabs: Array<{ label: string; value: FeedView }> = [
  { label: "Лента", value: "feed" },
  { label: "Поиск", value: "marketplace" },
  { label: "Загрузить", value: "upload" },
];

type PopularItem = {
  title: string;
  query: string;
  price: string;
  groupPrice: string;
  imageUrl: string;
};

const popularItems: PopularItem[] = [
  {
    title: "iPhone 16 Pro",
    query: "iPhone 16 Pro",
    price: "от 539 000 ₸",
    groupPrice: "группа от 499 000 ₸",
    imageUrl:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "AirPods Pro",
    query: "AirPods Pro 2",
    price: "от 89 000 ₸",
    groupPrice: "группа от 79 000 ₸",
    imageUrl:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "MacBook Air",
    query: "MacBook Air M3",
    price: "от 479 000 ₸",
    groupPrice: "группа от 449 000 ₸",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "PlayStation 5",
    query: "PlayStation 5 Slim",
    price: "от 289 000 ₸",
    groupPrice: "группа от 269 000 ₸",
    imageUrl:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Dyson Airwrap",
    query: "Dyson Airwrap",
    price: "от 249 000 ₸",
    groupPrice: "группа от 229 000 ₸",
    imageUrl:
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Nike sneakers",
    query: "Nike running sneakers",
    price: "от 42 000 ₸",
    groupPrice: "группа от 36 000 ₸",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
  },
];

export function VideoMarketplaceScroller() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [view, setView] = useState<FeedView>("feed");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [videos, setVideos] = useState<MarketplaceVideo[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(Boolean(supabase));
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [uploadForm, setUploadForm] = useState(defaultUploadForm);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [marketplaceQuery, setMarketplaceQuery] = useState("");
  const [marketplaceOffers, setMarketplaceOffers] = useState<MarketplaceOffer[]>(
    [],
  );
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<MarketplaceOffer | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const viewedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const storedLikes =
      window.localStorage.getItem("coinis-liked-video-ids") ??
      window.localStorage.getItem("adtok-liked-video-ids");
    if (storedLikes) {
      setLikedIds(JSON.parse(storedLikes) as string[]);
    }
  }, []);

  useEffect(() => {
    function syncHashView() {
      const hash = window.location.hash.replace("#", "");
      if (hash === "upload" || hash === "feed" || hash === "marketplace") {
        setView(hash);
      }
    }

    syncHashView();
    window.addEventListener("hashchange", syncHashView);
    return () => window.removeEventListener("hashchange", syncHashView);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;

    void loadVideos();
    const channel = supabase
      .channel("public-videos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "videos" },
        () => void loadVideos(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredVideos = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return videos;

    return videos.filter((video) =>
      [
        video.title,
        video.creator_name,
        video.product_name,
        video.marketplace,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, videos]);

  function setViewAndHash(nextView: FeedView) {
    setView(nextView);
    window.history.replaceState(null, "", `#${nextView}`);
  }

  async function loadVideos() {
    if (!supabase) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setStatus(formatSupabaseError(error.message));
    } else {
      setVideos(data ?? []);
      setStatus("");
    }

    setLoading(false);
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setStatus("Проверяю аккаунт...");
    const credentials = { email, password };
    const { error } = session
      ? { error: null }
      : await supabase.auth.signInWithPassword(credentials);

    if (error) {
      const signUp = await supabase.auth.signUp(credentials);
      if (signUp.error) {
        setStatus(signUp.error.message);
        return;
      }
      setStatus(
        "Аккаунт создан. Если включено подтверждение почты, проверьте email.",
      );
    } else {
      setStatus("Вход выполнен.");
    }

    setPassword("");
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setStatus("Вы вышли из аккаунта.");
  }

  async function searchMarketplaceProduct(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const productQuery = uploadForm.productQuery.trim();
    if (!productQuery) {
      setStatus("Введите название товара.");
      return;
    }

    setOfferLoading(true);
    setSelectedOffer(null);
    setOffers([]);
    setStatus("Ищу товар на маркетплейсах...");

    try {
      const payload = await fetchMarketplaceOffers(productQuery, 8);
      setOffers(payload.offers ?? []);
      setStatus(
        payload.offers?.length
          ? "Выберите карточку товара из результатов."
          : "Товар не найден. Попробуйте другое название.",
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Не удалось получить товары с маркетплейса.",
      );
    } finally {
      setOfferLoading(false);
    }
  }

  async function searchMarketplaceTab(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const productQuery = marketplaceQuery.trim();

    if (!productQuery) {
      setStatus("Введите название товара для поиска.");
      return;
    }

    await runMarketplaceSearch(productQuery, 16);
  }

  async function runMarketplaceSearch(productQuery: string, limit = 16) {
    setMarketplaceLoading(true);
    setMarketplaceOffers([]);
    setStatus("Ищу товары в маркетплейсах...");

    try {
      const payload = await fetchMarketplaceOffers(productQuery, limit);
      setMarketplaceOffers(payload.offers ?? []);
      setStatus(
        payload.offers?.length
          ? "Маркетплейс обновлен. Можно открыть товар или прикрепить его к видео."
          : "Товары не найдены. Попробуйте другой запрос.",
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Не удалось получить товары с маркетплейсов.",
      );
    } finally {
      setMarketplaceLoading(false);
    }
  }

  function openPopularItem(item: PopularItem) {
    setMarketplaceQuery(item.query);
    setViewAndHash("marketplace");
    void runMarketplaceSearch(item.query, 12);
  }

  function attachOfferToUpload(offer: MarketplaceOffer) {
    setSelectedOffer(offer);
    setOffers((current) => {
      const exists = current.some(
        (item) => item.id === offer.id && item.marketplace === offer.marketplace,
      );
      return exists ? current : [offer, ...current];
    });
    setUploadForm((current) => ({
      ...current,
      productQuery: offer.title,
    }));
    setViewAndHash("upload");
    setStatus("Товар выбран. Осталось добавить канал, название и видео.");
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    if (!session) {
      setStatus("Сначала войдите или зарегистрируйтесь.");
      return;
    }

    if (!videoFile) {
      setStatus("Выберите видеофайл.");
      return;
    }

    if (!selectedOffer) {
      setStatus("Сначала найдите и выберите товар с маркетплейса.");
      return;
    }

    if (videoFile.size > maxUploadBytes) {
      setStatus(
        `Видео слишком большое: ${formatBytes(videoFile.size)}. Загружайте MP4/WebM до ${formatBytes(maxUploadBytes)}.`,
      );
      return;
    }

    setUploading(true);
    setStatus("Загружаю видео...");

    const filePath = `${session.user.id}/${createUploadId()}-${sanitizeFileName(
      videoFile.name,
    )}`;
    const { error: uploadError } = await supabase.storage
      .from(videoBucket)
      .upload(filePath, videoFile, {
        cacheControl: "3600",
        contentType: videoFile.type || "video/mp4",
        upsert: false,
      });

    if (uploadError) {
      setUploading(false);
      setStatus(formatSupabaseError(uploadError.message));
      return;
    }

    const { data: publicVideo } = supabase.storage
      .from(videoBucket)
      .getPublicUrl(filePath);

    setStatus("Сохраняю видео и карточку товара...");
    const insertPayload = {
      user_id: session.user.id,
      creator_name:
        uploadForm.channelName.trim() ||
        session.user.email?.split("@")[0] ||
        "Channel",
      creator_handle: null,
      title: uploadForm.title.trim(),
      caption: null,
      video_url: publicVideo.publicUrl,
      video_path: filePath,
      product_name: selectedOffer.title,
      product_price: selectedOffer.priceKzt ?? null,
      product_currency: "KZT",
      product_url: selectedOffer.sourceUrl,
      marketplace: selectedOffer.marketplace,
      product_image_url: selectedOffer.imageUrl,
      product_offer_id: selectedOffer.id,
      product_origin_country: selectedOffer.originCountry ?? null,
    };

    let usedLegacyProductColumns = false;
    let { error: insertError } = await supabase.from("videos").insert(insertPayload);

    if (insertError && isMissingProductCardColumns(insertError.message)) {
      const {
        product_image_url: _productImageUrl,
        product_offer_id: _productOfferId,
        product_origin_country: _productOriginCountry,
        ...legacyPayload
      } = insertPayload;

      const retry = await supabase.from("videos").insert(legacyPayload);
      insertError = retry.error;
      usedLegacyProductColumns = !retry.error;

      if (!insertError) {
        setStatus(
          "Видео сохранено. Чтобы показывать фото товара из маркетплейса, выполните свежий SQL из supabase/schema.sql.",
        );
      }
    }

    if (insertError) {
      setUploading(false);
      setStatus(formatSupabaseError(insertError.message));
      return;
    }

    setUploadForm(defaultUploadForm);
    setVideoFile(null);
    setOffers([]);
    setSelectedOffer(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploading(false);
    setViewAndHash("feed");
    setStatus(
      usedLegacyProductColumns
        ? "Видео опубликовано. Чтобы фото товара сохранялось из маркетплейса, выполните свежий SQL из supabase/schema.sql."
        : "Видео опубликовано в ленте.",
    );
    await loadVideos();
  }

  async function handleLike(video: MarketplaceVideo) {
    if (!supabase || likedIds.includes(video.id)) return;

    const nextLikedIds = [...likedIds, video.id];
    setLikedIds(nextLikedIds);
    window.localStorage.setItem(
      "coinis-liked-video-ids",
      JSON.stringify(nextLikedIds),
    );
    setVideos((current) =>
      current.map((item) =>
        item.id === video.id
          ? { ...item, likes_count: item.likes_count + 1 }
          : item,
      ),
    );
    await supabase.rpc("increment_video_counter", {
      counter_name: "likes",
      video_id: video.id,
    });
  }

  async function handleView(videoId: string) {
    if (!supabase || viewedIdsRef.current.has(videoId)) return;

    viewedIdsRef.current.add(videoId);
    setVideos((current) =>
      current.map((item) =>
        item.id === videoId
          ? { ...item, views_count: item.views_count + 1 }
          : item,
      ),
    );
    await supabase.rpc("increment_video_counter", {
      counter_name: "views",
      video_id: videoId,
    });
  }

  return (
    <main className="space-y-8">
      <section className="mx-auto max-w-6xl py-8 text-white">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-white/72">CoiNIS marketplace</p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Покупай дешевле вместе.
            </h1>
            <div className="mt-6 grid w-full max-w-md grid-cols-3 gap-2 rounded-full border border-white/25 bg-white/12 p-1 backdrop-blur-md">
              {feedTabs.map((tab) => (
                <button
                  className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                    view === tab.value
                      ? "bg-white text-content shadow-sm"
                      : "text-white/72 hover:bg-white/15 hover:text-white"
                  }`}
                  key={tab.value}
                  onClick={() => setViewAndHash(tab.value)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HeroMetric label="Видео" value={String(videos.length)} />
            <HeroMetric label="Лайки" value={formatCompact(sumBy(videos, "likes_count"))} />
            <HeroMetric label="Просмотры" value={formatCompact(sumBy(videos, "views_count"))} />
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularItems.map((item) => (
            <button
              className="group overflow-hidden rounded-lg border border-white/70 bg-white/72 text-left text-content shadow-[0_16px_44px_rgba(20,93,140,0.14)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
              key={item.title}
              onClick={() => openPopularItem(item)}
              type="button"
            >
              <div className="grid grid-cols-[104px_1fr] gap-3 p-3">
                <img
                  alt={item.title}
                  className="aspect-square rounded-md object-cover"
                  src={item.imageUrl}
                />
                <div className="min-w-0">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-content-secondary">{item.price}</p>
                  <p className="mt-2 text-sm font-semibold text-success">
                    {item.groupPrice}
                  </p>
                  <span className="mt-3 inline-flex items-center text-sm font-semibold text-content">
                    Найти
                    <ArrowRight className="ml-1 size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-5" id={view}>
        <div className="mx-auto grid w-full max-w-xl grid-cols-3 gap-2 rounded-full border border-white/60 bg-white/70 p-1 shadow-sm backdrop-blur-md">
          {feedTabs.map((tab) => (
            <button
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                view === tab.value
                  ? "bg-white text-content shadow-sm"
                  : "text-content-secondary hover:bg-white/55 hover:text-content"
              }`}
              key={tab.value}
              onClick={() => setViewAndHash(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        {!supabase ? <SupabaseSetupNotice /> : null}

        {status ? (
          <div className="rounded-lg border border-white/70 bg-white/55 px-4 py-3 text-sm text-content-secondary shadow-sm backdrop-blur">
            {status}
          </div>
        ) : null}

        {view === "upload" ? (
          <section className="space-y-4">
            <AuthPanel
              email={email}
              password={password}
              session={session}
              setEmail={setEmail}
              setPassword={setPassword}
              onAuth={handleAuth}
              onSignOut={handleSignOut}
            />
            <UploadPanel
              disabled={!session || !supabase || uploading || !selectedOffer}
              fileInputRef={fileInputRef}
              form={uploadForm}
              offerLoading={offerLoading}
              offers={offers}
              selectedOffer={selectedOffer}
              setForm={setUploadForm}
              setSelectedOffer={setSelectedOffer}
              setVideoFile={setVideoFile}
              uploading={uploading}
              videoFile={videoFile}
              onSearchProduct={searchMarketplaceProduct}
              onSubmit={handleUpload}
            />
          </section>
        ) : view === "marketplace" ? (
          <MarketplacePanel
            loading={marketplaceLoading}
            offers={marketplaceOffers}
            query={marketplaceQuery}
            setQuery={setMarketplaceQuery}
            onAttach={attachOfferToUpload}
            onSearch={searchMarketplaceTab}
          />
        ) : (
          <FeedPanel
            likedIds={likedIds}
            loading={loading}
            query={query}
            setQuery={setQuery}
            videos={filteredVideos}
            onLike={handleLike}
            onView={handleView}
          />
        )}
      </section>
    </main>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/25 bg-white/12 px-4 py-3 backdrop-blur">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/62">{label}</p>
    </div>
  );
}

function SupabaseSetupNotice() {
  return (
    <Card className="border-white/80">
      <p className="font-semibold text-content">Нужно подключить Supabase</p>
      <p className="mt-2 text-sm leading-6 text-content-secondary">
        Добавьте `NEXT_PUBLIC_SUPABASE_URL` и
        `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, затем выполните SQL из
        `supabase/schema.sql`.
      </p>
      <div className="mt-3 grid gap-2 text-xs text-content-tertiary sm:grid-cols-2">
        <p>URL: {supabaseConfig.hasUrl ? "найден" : "не найден"}</p>
        <p>
          Publishable key:{" "}
          {supabaseConfig.hasPublishableKey ? "найден" : "не найден"}
        </p>
      </div>
    </Card>
  );
}

function AuthPanel({
  email,
  password,
  session,
  setEmail,
  setPassword,
  onAuth,
  onSignOut,
}: {
  email: string;
  password: string;
  session: Session | null;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onAuth: (event: FormEvent<HTMLFormElement>) => void;
  onSignOut: () => void;
}) {
  if (session) {
    return (
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full border border-white/70 bg-white/45">
            <UserRound className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-content">Аккаунт подключен</p>
            <p className="truncate text-sm text-content-secondary">
              {session.user.email}
            </p>
          </div>
        </div>
        <button className={buttonClasses("secondary")} onClick={onSignOut} type="button">
          <LogOut className="mr-2 size-4" />
          Выйти
        </button>
      </Card>
    );
  }

  return (
    <Card>
      <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={onAuth}>
        <input
          className={inputClasses}
          placeholder="email"
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className={inputClasses}
          minLength={6}
          placeholder="password"
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button className={buttonClasses("primary")} type="submit">
          Войти / создать
        </button>
      </form>
    </Card>
  );
}

function FeedPanel({
  likedIds,
  loading,
  query,
  setQuery,
  videos,
  onLike,
  onView,
}: {
  likedIds: string[];
  loading: boolean;
  query: string;
  setQuery: (value: string) => void;
  videos: MarketplaceVideo[];
  onLike: (video: MarketplaceVideo) => void;
  onView: (videoId: string) => void;
}) {
  return (
    <section className="space-y-5">
      <div className="mx-auto flex max-w-[430px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-content">Лента</h2>
        <label className="relative block sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary" />
          <input
            className={`${inputClasses} w-full py-2 pl-10 pr-3`}
            placeholder="Поиск"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <Card className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="size-7 animate-spin text-content-secondary" />
        </Card>
      ) : videos.length ? (
        <div className="mx-auto max-w-[430px] snap-y snap-mandatory space-y-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              liked={likedIds.includes(video.id)}
              video={video}
              onLike={onLike}
              onView={onView}
            />
          ))}
        </div>
      ) : (
        <Card className="mx-auto flex min-h-[360px] max-w-[430px] items-center justify-center text-center">
          <div>
            <Play className="mx-auto mb-3 size-8 text-content-tertiary" />
            <p className="font-semibold text-content">Видео пока нет</p>
          </div>
        </Card>
      )}
    </section>
  );
}

function MarketplacePanel({
  loading,
  offers,
  query,
  setQuery,
  onAttach,
  onSearch,
}: {
  loading: boolean;
  offers: MarketplaceOffer[];
  query: string;
  setQuery: (value: string) => void;
  onAttach: (offer: MarketplaceOffer) => void;
  onSearch: (event?: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="space-y-4">
      <Card>
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={onSearch}>
          <label className="grid gap-2 text-sm text-content-secondary">
            Поиск товара
            <input
              className={inputClasses}
              placeholder="например sneakers, headphones, skincare"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button
            className={`${buttonClasses("primary")} self-end`}
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Search className="mr-2 size-4" />
            )}
            Найти
          </button>
        </form>
      </Card>

      {loading ? (
        <Card className="flex min-h-[260px] items-center justify-center">
          <Loader2 className="size-7 animate-spin text-content-secondary" />
        </Card>
      ) : offers.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {offers.map((offer) => (
            <Card key={`${offer.marketplace}-${offer.id}`} className="space-y-3">
              <ProductOfferCard offer={offer} />
              <div className="grid gap-2 sm:grid-cols-2">
                <a
                  className={buttonClasses("secondary")}
                  href={offer.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ShoppingBag className="mr-2 size-4" />
                  Открыть
                </a>
                <button
                  className={buttonClasses("primary")}
                  onClick={() => onAttach(offer)}
                  type="button"
                >
                  <UploadCloud className="mr-2 size-4" />
                  В видео
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex min-h-[260px] items-center justify-center text-center">
          <div>
            <ShoppingBag className="mx-auto mb-3 size-8 text-content-tertiary" />
            <p className="font-semibold text-content">Маркетплейс пуст</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-content-secondary">
              Найдите товар, откройте карточку или сразу прикрепите его к видео.
            </p>
          </div>
        </Card>
      )}
    </section>
  );
}

function UploadPanel({
  disabled,
  fileInputRef,
  form,
  offerLoading,
  offers,
  selectedOffer,
  setForm,
  setSelectedOffer,
  setVideoFile,
  uploading,
  videoFile,
  onSearchProduct,
  onSubmit,
}: {
  disabled: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  form: typeof defaultUploadForm;
  offerLoading: boolean;
  offers: MarketplaceOffer[];
  selectedOffer: MarketplaceOffer | null;
  setForm: (form: typeof defaultUploadForm) => void;
  setSelectedOffer: (offer: MarketplaceOffer) => void;
  setVideoFile: (file: File | null) => void;
  uploading: boolean;
  videoFile: File | null;
  onSearchProduct: (event?: FormEvent<HTMLFormElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Card>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            label="Имя канала"
            placeholder="например Tech Channel"
            required
            value={form.channelName}
            onChange={(value) => setForm({ ...form, channelName: value })}
          />
          <TextInput
            label="Название видео"
            placeholder="короткое название"
            required
            value={form.title}
            onChange={(value) => setForm({ ...form, title: value })}
          />
        </div>

        <div className="rounded-lg border border-white/70 bg-white/35 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <TextInput
              label="Товар из маркетплейса"
              placeholder="например wireless headphones"
              required
              value={form.productQuery}
              onChange={(value) => setForm({ ...form, productQuery: value })}
            />
            <button
              className={`${buttonClasses("secondary")} self-end`}
              disabled={offerLoading}
              onClick={() => onSearchProduct()}
              type="button"
            >
              {offerLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Search className="mr-2 size-4" />
              )}
              Найти
            </button>
          </div>

          {offers.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {offers.map((offer) => (
                <button
                  className={`overflow-hidden rounded-lg border text-left transition ${
                    selectedOffer?.id === offer.id
                      ? "border-accent/40 bg-accent/10"
                      : "border-white/70 bg-white/35 hover:bg-white/60"
                  }`}
                  key={`${offer.marketplace}-${offer.id}`}
                  onClick={() => setSelectedOffer(offer)}
                  type="button"
                >
                  <ProductOfferCard compact offer={offer} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <label className="grid gap-2 text-sm text-content-secondary">
          Видео файл
          <input
            accept="video/mp4,video/webm,video/quicktime"
            className={fileInputClasses}
            ref={fileInputRef}
            required
            type="file"
            onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
          />
          {videoFile ? (
            <span className="text-xs text-content-tertiary">
              {videoFile.name} / {formatBytes(videoFile.size)}
            </span>
          ) : null}
        </label>

        {selectedOffer ? (
          <div className="rounded-lg border border-white/80 bg-white/42">
            <ProductOfferCard offer={selectedOffer} />
          </div>
        ) : null}

        <button className={buttonClasses("primary")} disabled={disabled} type="submit">
          {uploading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <UploadCloud className="mr-2 size-4" />
          )}
          Опубликовать видео
        </button>
      </form>
    </Card>
  );
}

function VideoCard({
  liked,
  video,
  onLike,
  onView,
}: {
  liked: boolean;
  video: MarketplaceVideo;
  onLike: (video: MarketplaceVideo) => void;
  onView: (videoId: string) => void;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "700px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      className="snap-start overflow-hidden rounded-[28px] border border-white/70 bg-black shadow-[0_22px_70px_rgba(12,52,84,0.18)]"
      onMouseEnter={() => onView(video.id)}
      ref={cardRef}
    >
      <div className="relative aspect-[9/16] w-full bg-black">
        {shouldLoadVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            controls
            loop
            playsInline
            preload="none"
            src={video.video_url}
            onError={() => setLoadError(true)}
            onPlay={() => onView(video.id)}
          />
        ) : (
          <button
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/78"
            onClick={() => setShouldLoadVideo(true)}
            type="button"
          >
            <Play className="size-10" />
            <span className="text-sm">Загрузить видео</span>
          </button>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/74 to-transparent p-3">
          <div className="pointer-events-auto space-y-3">
            <div>
              <p className="text-xs font-semibold text-white/72">
                {video.creator_name}
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">{video.title}</h2>
            </div>
            <ProductSheet video={video} />
          </div>
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            className={buttonClasses(liked ? "primary" : "secondary")}
            onClick={() => onLike(video)}
            type="button"
          >
            <Heart className={`mr-2 size-4 ${liked ? "fill-content" : ""}`} />
            {formatCompact(video.likes_count)}
          </button>
          <div className="rounded-full border border-white/25 bg-black/55 px-3 py-2 text-center text-xs text-white backdrop-blur">
            {formatCompact(video.views_count)} views
          </div>
        </div>

        {loadError ? (
          <div className="absolute inset-x-4 top-4 rounded-lg border border-white/25 bg-black/75 p-3 text-sm text-white">
            Видео не загрузилось. Проверьте public-доступ к Storage bucket
            `ad-videos`.
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ProductSheet({ video }: { video: MarketplaceVideo }) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/94 p-3 text-content shadow-lg backdrop-blur">
      <div className="grid grid-cols-[64px_1fr] gap-3">
      {video.product_image_url ? (
        <img
          alt={video.product_name}
          className="aspect-square w-16 rounded-md object-cover"
          src={video.product_image_url}
        />
      ) : (
        <div className="flex aspect-square w-16 items-center justify-center rounded-md bg-accent/10">
          <ShoppingBag className="size-6 text-accent" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-content-tertiary">
          {video.marketplace || "Marketplace"}
        </p>
        <p className="line-clamp-2 font-semibold text-content">
          {video.product_name}
        </p>
        <p className="mt-1 text-sm text-content-secondary">
          {formatProductPrice(video)}
        </p>
      </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <a
        className={buttonClasses("primary")}
        href={`/search#${slugForHash(video.product_name)}`}
      >
        <UsersRound className="mr-2 size-4" />
        Подключиться
      </a>
      <a
        className={buttonClasses("secondary")}
        href={video.product_url}
        rel="noreferrer"
        target="_blank"
      >
        <ShoppingBag className="mr-2 size-4" />
        Купить
      </a>
      </div>
    </div>
  );
}

function ProductOfferCard({
  compact = false,
  offer,
}: {
  compact?: boolean;
  offer: MarketplaceOffer;
}) {
  return (
    <div
      className={`grid gap-3 p-3 ${
        compact ? "grid-cols-[72px_1fr]" : "sm:grid-cols-[96px_1fr]"
      }`}
    >
      <img
        alt={offer.title}
        className={`${compact ? "size-[72px]" : "size-24"} rounded-md object-cover`}
        src={offer.imageUrl}
      />
      <div className="min-w-0">
        <p className="text-xs text-content-tertiary">
          {offer.marketplace}
          {offer.originCountry ? ` / ${offer.originCountry}` : ""}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-content">
          {offer.title}
        </p>
        <p className="mt-2 text-sm font-bold text-content">
          {offer.priceKzt
            ? formatKzt(offer.priceKzt)
            : offer.priceText || "Цена не указана"}
        </p>
      </div>
    </div>
  );
}

function TextInput({
  label,
  placeholder,
  required,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  required?: boolean;
  type?: "text" | "number" | "url";
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-content-secondary">
      {label}
      <input
        className={inputClasses}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function formatProductPrice(video: MarketplaceVideo) {
  if (!video.product_price) return "Цена не указана";
  if (video.product_currency === "KZT") return formatKzt(video.product_price);
  return `${video.product_price} ${video.product_currency}`;
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("ru", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

function sanitizeFileName(value: string) {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);

  return sanitized || "video.mp4";
}

function createUploadId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const randomPart =
    globalThis.crypto?.getRandomValues?.(new Uint32Array(1))[0]?.toString(16) ??
    Math.random().toString(16).slice(2);

  return `${Date.now().toString(36)}-${randomPart}`;
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function formatSupabaseError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("product_image_url")) {
    return "В Supabase нужно обновить таблицу videos: выполните свежий SQL из supabase/schema.sql, чтобы добавить поля карточки товара.";
  }

  if (normalized.includes("public.videos") || normalized.includes("table")) {
    return "Supabase подключен, но таблица public.videos еще не создана. Выполните SQL из supabase/schema.sql.";
  }

  if (normalized.includes("bucket") || normalized.includes("ad-videos")) {
    return "Supabase подключен, но Storage bucket ad-videos еще не создан. Выполните SQL из supabase/schema.sql.";
  }

  return message;
}

async function fetchMarketplaceOffers(query: string, limit: number) {
  const response = await fetch("/api/marketplace-offers", {
    body: JSON.stringify({
      limit,
      marketplaces: [
        "Amazon",
        "AliExpress",
        "Alibaba",
        "eBay",
        "Temu",
        "Trendyol",
        "Shein",
        "Ozon",
      ],
      query,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const payload = (await response.json()) as MarketplaceSearchPayload;

  if (!response.ok || payload.error) {
    throw new Error(payload.error || "Marketplace search failed");
  }

  return payload;
}

function isMissingProductCardColumns(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("product_image_url") ||
    normalized.includes("product_offer_id") ||
    normalized.includes("product_origin_country") ||
    (normalized.includes("column") && normalized.includes("schema cache"))
  );
}

function slugForHash(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function sumBy(
  videos: MarketplaceVideo[],
  key: "likes_count" | "views_count",
) {
  return videos.reduce((sum, video) => sum + video[key], 0);
}
