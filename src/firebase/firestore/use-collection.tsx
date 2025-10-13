'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Add Firestore document ID to data. */
export type WithId<T> = T & { id: string };

/** Hook return structure. */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/** Internal Firestore Query reference helper for path extraction. */
interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    };
  };
}

/**
 * Subscribe to a Firestore query or collection in real time.
 *
 * ⚠️ Must be passed a **memoized** query (via `useMemoFirebase` or `useMemo`).
 */
export function useCollection<T = any>(
  memoizedTargetRefOrQuery:
    | ((CollectionReference<DocumentData> | Query<DocumentData>) & { __memo?: boolean })
    | null
    | undefined
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  const [data, setData] = useState<ResultItemType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (!memoizedTargetRefOrQuery.__memo) {
      console.error(
        'useCollection received a non-memoized Firestore reference. Use useMemoFirebase() to memoize it properly.'
      );
      throw new Error(
        'Firestore query not memoized — use useMemoFirebase or React.useMemo with stable deps.'
      );
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        if (!isMounted) return;
        const results = snapshot.docs.map(
          (doc) => ({ ...(doc.data() as T), id: doc.id }) as ResultItemType
        );
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        if (!isMounted) return;

        // Attempt to extract collection path
        let path = 'unknown';
        try {
          path =
            memoizedTargetRefOrQuery.type === 'collection'
              ? (memoizedTargetRefOrQuery as CollectionReference).path
              : (memoizedTargetRefOrQuery as InternalQuery)._query.path.canonicalString();
        } catch {
          path = '[unavailable-path]';
        }

        // Wrap permission-denied in a more descriptive error
        const contextualError =
          err.code === 'permission-denied'
            ? new FirestorePermissionError({ operation: 'list', path })
            : err;

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // Emit for global listeners (e.g., toast notifications)
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}
