// import { useState } from 'react'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import './App.css'

import { QueueDashboard } from "./features/queue/QueueDashboard";
// import { OnboardingStep1 } from "./features/students/components/onboarding/OnboardingStep1";
// import { StudentDashboard } from "./features/students/StudentDashboard";
import { RegisterGateway } from "./features/register/RegisterGateway";
import { CustomerGateway } from "./features/customer-portal/CustomerGateway";
function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      {/* <QueueDashboard /> */}
      {/* <RegisterGateway /> */}
      {/* <StudentDashboard /> */}
      {/* <OnboardingStep1 /> */}
      <CustomerGateway />
    </>
  );
}

export default App;
