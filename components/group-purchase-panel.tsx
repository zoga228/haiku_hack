"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ExternalLink, Plus, UserPlus, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLowestRetailVariant } from "@/lib/catalog";
import { formatKzt } from "@/lib/format";
import type { Product } from "@/types/commerce";

type UserProfile = {
  name: string;
  phone: string;
};

type Friend = {
  id: string;
  name: string;
};

type GroupPurchasePanelProps = {
  product?: Product | null;
};

const profileKey = "coinis-profile";
const friendsKey = "coinis-friends";
const inputClasses =
  "min-h-11 rounded-lg border border-white/70 bg-white/55 px-4 py-3 text-content outline-none transition focus:border-accent/40 focus:bg-white";

export function GroupPurchasePanel({ product }: GroupPurchasePanelProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [friendName, setFriendName] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [quantityPerPerson, setQuantityPerPerson] = useState(1);

  useEffect(() => {
    const savedProfile = window.localStorage.getItem(profileKey);
    const savedFriends = window.localStorage.getItem(friendsKey);

    if (savedProfile) {
      const parsed = JSON.parse(savedProfile) as UserProfile;
      setProfile(parsed);
      setProfileName(parsed.name);
      setProfilePhone(parsed.phone);
    }

    if (savedFriends) {
      setFriends(JSON.parse(savedFriends) as Friend[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(friendsKey, JSON.stringify(friends));
  }, [friends]);

  const primaryVariant = product ? getLowestRetailVariant(product) : null;
  const participantCount = profile ? 1 + selectedFriendIds.length : 0;
  const totalQuantity = participantCount * quantityPerPerson;
  const groupReady = product ? totalQuantity >= product.minParticipants : false;
  const unitPrice = product
    ? groupReady
      ? product.groupPriceKzt
      : product.retailPriceKzt
    : 0;
  const totalPrice = unitPrice * totalQuantity;
  const perPersonPrice = participantCount > 0 ? unitPrice * quantityPerPerson : 0;

  const selectedFriends = useMemo(
    () => friends.filter((friend) => selectedFriendIds.includes(friend.id)),
    [friends, selectedFriendIds],
  );

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextProfile = {
      name: profileName.trim(),
      phone: profilePhone.trim(),
    };

    if (!nextProfile.name) return;

    setProfile(nextProfile);
    window.localStorage.setItem(profileKey, JSON.stringify(nextProfile));
  }

  function addFriend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = friendName.trim();

    if (!name) return;

    const friend = {
      id: `${Date.now()}-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
    };

    setFriends((current) => [friend, ...current]);
    setSelectedFriendIds((current) => [friend.id, ...current]);
    setFriendName("");
  }

  function toggleFriend(friendId: string) {
    setSelectedFriendIds((current) =>
      current.includes(friendId)
        ? current.filter((id) => id !== friendId)
        : [...current, friendId],
    );
  }

  return (
    <Card className="space-y-5">
      <div>
        <Badge variant="accent">
          <UsersRound className="mr-1.5 size-3" />
          Групповая покупка
        </Badge>
        <h2 className="mt-3 text-xl font-semibold text-content">
          Пользователь и друзья
        </h2>
        <p className="mt-2 text-sm leading-6 text-content-secondary">
          Зарегистрируйтесь, добавьте друзей и соберите покупку вместе.
        </p>
      </div>

      <form className="grid gap-3" onSubmit={saveProfile}>
        <label className="grid gap-2 text-sm text-content-secondary">
          Ваше имя
          <input
            className={inputClasses}
            placeholder="Например, Айбек"
            value={profileName}
            onChange={(event) => setProfileName(event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm text-content-secondary">
          Телефон или контакт
          <input
            className={inputClasses}
            placeholder="+7..."
            value={profilePhone}
            onChange={(event) => setProfilePhone(event.target.value)}
          />
        </label>
        <button className={buttonClasses("primary")} type="submit">
          {profile ? "Обновить профиль" : "Зарегистрироваться"}
        </button>
      </form>

      {profile ? (
        <div className="rounded-lg border border-white/70 bg-white/35 p-4 text-sm text-content-secondary">
          Вы вошли как{" "}
          <span className="font-semibold text-content">{profile.name}</span>
        </div>
      ) : null}

      <div className="space-y-3">
        <form className="grid gap-2 sm:grid-cols-[1fr_auto]" onSubmit={addFriend}>
          <input
            className={inputClasses}
            placeholder="Имя друга"
            value={friendName}
            onChange={(event) => setFriendName(event.target.value)}
          />
          <button className={buttonClasses("secondary")} type="submit">
            <UserPlus className="mr-1.5 size-4" />
            Добавить
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {friends.length > 0 ? (
            friends.map((friend) => {
              const selected = selectedFriendIds.includes(friend.id);

              return (
                <button
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    selected
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-white/70 bg-white/30 text-content-secondary hover:bg-white/55"
                  }`}
                  key={friend.id}
                  onClick={() => toggleFriend(friend.id)}
                  type="button"
                >
                  {friend.name}
                </button>
              );
            })
          ) : (
            <p className="text-sm text-content-tertiary">
              Добавьте друзей, чтобы собрать групповую покупку.
            </p>
          )}
        </div>
      </div>

      {product && primaryVariant ? (
        <div className="space-y-4 rounded-lg border border-white/70 bg-white/45 p-4">
          <div className="grid gap-3 sm:grid-cols-[72px_1fr]">
            <img
              alt={product.name}
              className="aspect-square w-full rounded-lg object-cover sm:w-[72px]"
              src={primaryVariant.imageUrl}
            />
            <div>
              <p className="text-xs text-content-tertiary">Выбранный товар</p>
              <h3 className="line-clamp-2 font-semibold text-content">
                {product.name}
              </h3>
              <p className="mt-1 text-xs text-content-secondary">
                {primaryVariant.marketplace} / минимум {product.minParticipants} шт.
              </p>
            </div>
          </div>

          <label className="grid gap-2 text-sm text-content-secondary">
            Количество на человека
            <input
              className={inputClasses}
              min={1}
              type="number"
              value={quantityPerPerson}
              onChange={(event) =>
                setQuantityPerPerson(Math.max(1, Number(event.target.value)))
              }
            />
          </label>

          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <Metric label="Участники" value={String(participantCount)} />
            <Metric label="Всего штук" value={String(totalQuantity)} />
            <Metric label="Цена за шт." value={formatKzt(unitPrice)} strong />
          </div>

          <div className="rounded-lg border border-success/20 bg-success/10 p-4">
            <p className="text-sm text-content-secondary">
              {groupReady
                ? "Групповая цена активна."
                : `До групповой цены нужно еще ${Math.max(
                    0,
                    product.minParticipants - totalQuantity,
                  )} шт.`}
            </p>
            <p className="mt-2 text-2xl font-bold text-content">
              {formatKzt(totalPrice)}
            </p>
            <p className="text-xs text-content-tertiary">
              Примерно {formatKzt(perPersonPrice)} с человека
            </p>
          </div>

          {selectedFriends.length > 0 ? (
            <div className="text-xs text-content-secondary">
              В комнате: {profile?.name ?? "Вы"},{" "}
              {selectedFriends.map((friend) => friend.name).join(", ")}
            </div>
          ) : null}

          <a
            className={buttonClasses("primary")}
            href={primaryVariant.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="mr-1.5 size-4" />
            Открыть товар на {primaryVariant.marketplace}
          </a>
        </div>
      ) : (
        <div className="rounded-lg border border-white/70 bg-white/35 p-4 text-sm text-content-secondary">
          <Plus className="mb-2 size-4 text-accent" />
          Выберите live-товар, чтобы создать групповую покупку.
        </div>
      )}
    </Card>
  );
}

function Metric({
  label,
  strong = false,
  value,
}: {
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/35 p-3">
      <p className="text-content-tertiary">{label}</p>
      <p className={`text-lg font-semibold ${strong ? "text-success" : "text-content"}`}>
        {value}
      </p>
    </div>
  );
}
