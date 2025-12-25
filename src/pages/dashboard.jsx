import { useRouter } from "next/router";
import styled, { keyframes } from "styled-components";
import { ScanLine, Scroll, Users, Compass } from "lucide-react";

/* ---------------- Animations ---------------- */
const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
`;

/* ---------------- Layout ---------------- */
const Page = styled.div`
  min-height: 100vh;
  background: url("/toth3.png") center / cover no-repeat;
  font-family: "Cinzel", serif;
`;

const Overlay = styled.div`
  min-height: 100vh;
  backdrop-filter: blur(8px) brightness(0.55);
  background: radial-gradient(circle, transparent 0%, rgba(0,0,0,0.7) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.75rem;
`;

/* ---------------- Header ---------------- */
const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fde68a;
  animation: ${float} 6s ease-in-out infinite;
  user-select: none;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  h1 {
    font-size: 2.8rem;
    letter-spacing: 3px;
    margin: 0;
  }

  svg {
    color: #fbbf24;
    filter: drop-shadow(0 0 10px rgba(251,191,36,0.6));
  }
`;

const Subtitle = styled.p`
  opacity: 0.85;
  max-width: 420px;
  margin-top: 0.5rem;
  text-align: center;
`;

/* ---------------- Buttons ---------------- */
const ActionButton = styled.button`
  width: 360px;
  padding: 1.4rem 1.8rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1.4rem;

  background: linear-gradient(
    135deg,
    rgba(120, 53, 15, 0.9),
    rgba(28, 25, 23, 0.95)
  );
  border: 1px solid rgba(251,191,36,0.35);
  color: #fde68a;
  font-size: 1.15rem;
  letter-spacing: 1px;
  font-weight: 700;
  text-transform: uppercase;

  cursor: pointer;
  backdrop-filter: blur(6px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.45);
  transition: all 0.3s ease;

  .icon {
    background: rgba(251,191,36,0.2);
    padding: 0.7rem;
    border-radius: 10px;
    color: #fbbf24;
  }

  &:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 18px 45px rgba(251,191,36,0.25);

    .icon {
      background: rgba(251,191,36,0.35);
      color: #fff;
    }
  }
`;

/* ---------------- Component ---------------- */
export default function Dashboard() {
  const router = useRouter();
  const isMod = true;

  return (
    <Page>
      <Overlay>
        <Header>
          <Compass size={48} className="animate-pulse" />
          <TitleRow>
            <h1>Dashboard</h1>
          </TitleRow>

          <Subtitle className="text-amber-100/80 max-w-2xl mx-auto">
            Scan QR codes to solve riddles and unveil the truth.
          </Subtitle>
        </Header>

        <ActionButton onClick={() => router.push("/scan")}>
          <div className="icon"><ScanLine size={24} /></div>
          Scan QR
        </ActionButton>

        {isMod && (
          <>
            <ActionButton onClick={() => router.push("/riddles")}>
              <div className="icon"><Scroll size={24} /></div>
              Riddle List
            </ActionButton>

            <ActionButton onClick={() => router.push("/users")}>
              <div className="icon"><Users size={24} /></div>
              User List
            </ActionButton>
          </>
        )}
      </Overlay>
    </Page>
  );
}
