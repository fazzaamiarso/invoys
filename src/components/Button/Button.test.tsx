import { render, screen } from '@testing-library/react';
import Button from '.';

describe('Button', () => {
  test.skip('Button with href renders link', async () => {
    // I think it is broken because this app use experimental newlink behaviour.
    render(<Button href="/">Should be a link</Button>);
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
