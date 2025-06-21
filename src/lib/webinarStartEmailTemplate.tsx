import * as React from 'react';

const WebinarStartEmailTemplate = ({
  webinarId,
}: {
  webinarId: string;
}) => (
  <>
    <h1>Welcome, Join the Partnership Campaign</h1>
    <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/live-webinar/${webinarId}`}>
      Click here to join the campaign discussion
    </a>
  </>
);

export default WebinarStartEmailTemplate;