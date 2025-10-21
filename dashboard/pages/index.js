

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    alert("test");
  }, []);


  useEffect(() => {
    alert();
    router.replace("/dashboard");
  }, [router]);

  return null;
}
