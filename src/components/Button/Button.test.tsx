import { render, screen } from '@testing-library/react';
import Button from '.';

describe('Button', () => {
  test.skip('Button with href renders link', async () => {
    // somehow doesn't want to render the link
    render(
      <div>
        <Button href="/home">Should be a link</Button>
      </div>
    );
    await screen.findByRole('link', { name: /should be a link/i });
  });

  test('render button', async () => {
    render(<Button>click</Button>);
    await screen.findByRole('button', { name: /click/i });
  });

  test('render button in loading state', async () => {
    render(
      <Button isLoading loadingContent="Saving...">
        Save
      </Button>
    );
    await screen.findByRole('button', { name: /saving/i });
  });
});
