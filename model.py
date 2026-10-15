import torch.nn as nn


class CNN(nn.Module):
    """Binary CNN for 128x128 RGB images. Output is one logit: sigmoid(logit) = P(dog)."""

    def __init__(self):
        super().__init__()
        def block(i, o):
            return [nn.Conv2d(i, o, 3, padding=1), nn.BatchNorm2d(o), nn.ReLU(), nn.MaxPool2d(2, 2)]

        self.conv_layers = nn.Sequential(*block(3, 32), *block(32, 64), *block(64, 128))
        self.fc_layers = nn.Sequential(
            nn.Linear(16 * 16 * 128, 256), nn.ReLU(), nn.Dropout(0.5), nn.Linear(256, 1)
        )

    def forward(self, x):
        x = self.conv_layers(x)
        return self.fc_layers(x.view(x.size(0), -1))
