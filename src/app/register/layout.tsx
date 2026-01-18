import React, { Suspense } from 'react';

const RegistrationPageLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense>{children}</Suspense>;
};

export default RegistrationPageLayout;
